# [Amazon SQS](https://aws.amazon.com/jp/sqs/) を触った時のメモ

## Requirements
- [aws-cdk](https://aws.amazon.com/jp/cdk/) の設定
  - ローカルの `node_modules` 以下に `aws-cdk` をインストールしているため、グローバルに aws-cdk をインストールする必要はない
  - ちょっと古いけど [AWS CDK Workshop](https://cdkworkshop.com/ja/) を一読しておくとよい
- NodeJS v18
  - 今回はあまり関係ないが、Node のバージョン次第で aws-sdk のバージョンが変わるので注意

## メモ
### SQS のセットアップ
aws-cdk を用いてデプロイする。
FIFO ではなく標準キューで作成。
特筆することはない。

### ローカルから SQS へメッセージを送れるように
Web のコンソールからメッセージを追加しても良いが、AWS SDK を触ってみたかったのでローカルのスクリプトからキューにメッセージを送信出来るようにする。

[producer/.env.example](./producer/.env.example) を producer/.env にリネームして、
上で作成した SQS の設定を書き込む。

- `AWS_REGION`:  SQS のあるリージョン
- `QUEUE_URL`:  SQS の URL

See [producer/index.ts](./producer/index.ts).

### キューがトリガーする Lambda 関数の作成
TypeScript で書いてそのままデプロイする。
[`NodejsFunction`](https://docs.aws.amazon.com/cdk/api/v2/docs/aws-cdk-lib.aws_lambda_nodejs-readme.html#nodejs-function) を利用してトランスパイルとバンドルを行う。

> **Note**
> [esbuild](https://esbuild.github.io/) をインストールしておく必要がある。

```sh
$ npm install --save-dev @types/node @types/aws-lambda esbuild
```

Lambda 関数のハンドラーの型が `@types/aws-lambda` で提供されている。
SQS のトリガーとして利用するので、`SQSHandler` とする。

### Lambda へ適切な実行ロールの付与
SQS から Lambda 関数をトリガーするため、適切な実行ロールを付与する必要がある。
デベロッパーガイドの[チュートリアル](https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/with-sqs-example.html#with-sqs-create-execution-role)の通り実行ロールを作成し、
Lambda 関数に設定する。
SQS の Lambdd トリガーへ設定する方法は[「AWS Lambda 関数をトリガーするためのキューの設定」](https://docs.aws.amazon.com/ja_jp/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-configure-lambda-function-trigger.html)を参照。

#### 後で読む
- [SQS クロスアカウントチュートリアル](https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/with-sqs-cross-account-example.html)

### 動作確認
SQS にメッセージを送る:

```sh
cd producer && npm run send-message
```

設定が上手くいっていれば Lambda 関数がトリガーされているはず。
Lambda 関数コンソールから CloudWatch のログを見て、送ったメッセージの内容が出力されていれば OK.