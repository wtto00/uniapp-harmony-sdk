/**
 * 每天检查DCloud官方发布的最新SDK版本
 * 如果有最新版本，则新建一个issue
 */
import { Octokit } from "@octokit/rest";

const url = "https://nativesupport.dcloud.net.cn/AppDocs/download/android.html";

console.log(`爬取DCloud离线页面: ${url}`);

const res = await fetch(url);

if (!res.ok) {
  console.error("爬取DCloud离线页面出错了", res);
  process.exit(1);
}

const content = await res.text();

const match = content.match(/\d{4}年\d{2}月\d{2}日发布——HBuilderX（\d+\.\d+\.\d+）/);

const latest = match?.[0];

if (!latest) {
  console.error(content);
  process.exit(1);
}

console.log(`查询到最新版本SDK为: ${latest}`);

const octokit = new Octokit({ auth: process.env.GITHUB_TOKEN });

const issuesRes = await octokit.rest.search.issuesAndPullRequests({
  q: `${latest}+is:issue`,
});

if (issuesRes.status !== 200) {
  console.error("搜索Issue出错了: ", issuesRes);
  process.exit(1);
}

const { items } = issuesRes.data;

const issue = items.find((item) => item.title === latest);

if (issue) {
  console.log(`已存在最新版本的Issue: https://github.com/wtto00/uniapp-android-sdk/issues/${issue.id}`);
  process.exit(0);
}

console.log("没有查询到该版本的Issue，开始创建Issue");

const create = await octokit.rest.issues.create({
  owner: "wtto00",
  repo: "uniapp-android-sdk",
  title: latest,
  body: `A new version of the Android offline SDK is now available!

Go to [download](${url}) and sync the repository.

Query NPM dependency [@dcloudio/uni-app](https://www.npmjs.com/package/@dcloudio/uni-app?activeTab=versions) version.`,
});

if (!create.status.toString().startsWith("2")) {
  console.error("创建Issue失败了: ", create);
  process.exit(1);
}

console.log(`创建Issue成功: ${create.data.url}`);
