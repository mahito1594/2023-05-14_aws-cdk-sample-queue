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

### Lambda から Secret Manager 経由で認証情報を取得する
SQS から受け取ったメッセージを外部システムへ POST することを想定。
API call のための認証情報を Secret Manager から取得する。

#### Secret Manager にパラメータを設定する
コンソールから設定できる。
シークレット名は `sample-auth` にしておく（何でもよい）。

#### Lambda 関数に拡張機能を入れる
[ユーザーガイド](https://docs.aws.amazon.com/ja_jp/secretsmanager/latest/userguide/retrieving-secrets_lambda.html)を参考に、AWS Parameters and Secrets Lambda Extension を ConsumerStack で作成した Lambda 関数のレイヤーに追加する。

また Lambda 実行ロールを、シークレットにアクセスできるように適切に変更する。
今回は [SecretsManagerReadWrite](https://us-east-1.console.aws.amazon.com/iamv2/home?region=ap-northeast-1#/policies/details/arn%3Aaws%3Aiam%3A%3Aaws%3Apolicy%2FSecretsManagerReadWrite?section=policy_permissions) ポリシーを Lambda 実行ロールに追加。

Lambda からシークレットを取得するには [`@aws-sdk/client-secrets-manager`](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-secrets-manager/) を利用する。

#### Lambda からシークレットを取得して HTTP メソッドを実行する
例として [httpbin.org](https://httpbin.org) を利用した。
https://httpbin.org/basic-auth はアクセストークンを返却したりはしないので、本当に動作しているかのみ確認する。
HTTP メソッドを実行するために [axios](https://axios-http.com) を利用している。

> **NOTE**
> Array.prototype.forEach の中で async/await を上手く使うには少し頭を使う。

### その他
ベース URL httpbin.org をハードコードするのではなく、Lambda の環境変数から取得するようにする。
Lambda 関数のコンソールからの設定だと `npm run cdk deploy` するたびに、コンソールから消えてしまう。
aws-cdk で Lambda 関数を作成する際に環境変数の設定も入れる。

See [AWS Lambda 環境変数の仕様](https://docs.aws.amazon.com/ja_jp/lambda/latest/dg/configuration-envvars.html)
