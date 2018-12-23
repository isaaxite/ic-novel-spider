## ic-novel-spider
用于爬取轻小说（http://www.shencou.com）的脚本

## 使用
```
# 安装依赖
npm i
```

## 设置下载内容

config.json
```
{
  "url": "http://www.shencou.com/read/0/40/index.html",
  "name": "东京暗鸦",
  "dir": "src"
}

```
- `url`：必须，小说目录链接, 比如: http://www.shencou.com/read/0/40/index.html；
- `name`：小说名字，主要用于文件名，若不填写则自动抓取网站的小说名；
- `dir`：指定目录（尽可指定一层目录），默认生成config.json统计目录src。

## 执行
```
npm run start
```