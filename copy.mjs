import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'
import JSON5 from 'json5'

const filesPath = path.resolve(import.meta.dirname, 'files.json')
const filesContent = fs.readFileSync(filesPath, 'utf8')
const files = JSON.parse(filesContent)

/**
 * @param {string} file
 */
async function md5(file) {
  const stream = fs.createReadStream(path.resolve(import.meta.dirname, file))
  const hash = crypto.createHash('md5')
  return new Promise((resolve, reject) => {
    stream.on('data', (chunk) => {
      // @ts-ignore
      hash.update(chunk, 'utf8')
    })
    stream.on('end', () => {
      const md5 = hash.digest('hex')
      resolve(md5)
    })
    stream.on('error', () => {
      reject(Error(`Failed to get md5 of file ${file}`))
    })
  })
}

const [source, version] = process.argv.slice(2)

if (!source || !version) {
  console.log('Unkonwn source or version.')
  console.log('eg:')
  console.log('\tnode copy.mjs ~/projects/uniapp-demo 3.0.0-4020920240930001')
  console.log('\tnode copy.mjs ../projects/uniapp-demo 3.0.0-4020920240930001')
  process.exit(0)
}
const releaseProject = path.resolve(import.meta.dirname, source, 'unpackage/release')

const harmonyProjectNames = fs.readdirSync(releaseProject)

const harmonyProjectName = harmonyProjectNames.find((name) => fs.existsSync(path.join(releaseProject, name, 'oh-package.json5')))

if (!harmonyProjectName) {
  console.log('未找到有效的的打包项目，请先在HBuilderX中运行本地打包App-Harmony')
  process.exit(-1)
}

const harmonyProject = path.join(releaseProject, harmonyProjectName)

const packagePath = path.join(harmonyProject, 'oh-package.json5')

const packageContent = fs.readFileSync(packagePath, 'utf8')

const packageJson = JSON5.parse(packageContent)

const dependencies = packageJson.dependencies

const targetPath = path.resolve(import.meta.dirname, `public/libs/${version}`)

if (!fs.existsSync(targetPath)) {
  fs.mkdirSync(targetPath, { recursive: true })
}

const targetList = {}

for (const name in dependencies) {
  const filePath = path.join(harmonyProject, dependencies[name])
  const relativePath = path.relative(harmonyProject, filePath).split(path.sep)
  if (relativePath[0] !== 'libs') continue
  const md5string = await md5(filePath)
  if (files[md5string]) {
    targetList[name] = files[md5string]
  } else {
    const filename = path.basename(filePath)
    const targetFilePath = path.join(targetPath, filename)
    console.log(filePath, targetFilePath)
    fs.cpSync(filePath, targetFilePath)
    files[md5string] = `${version}/${filename}`
    targetList[name] = files[md5string]
  }
}

fs.writeFileSync(path.join(targetPath, 'index.json'), JSON.stringify(targetList), 'utf8')

fs.writeFileSync(path.resolve(import.meta.dirname, 'files.json'), JSON.stringify(files, null, 2), 'utf8')
