# kintone-manage-space
manage-space.js: kintoneのスペースの作成、更新、表示、削除を自動化するためのNode.jsスクリプト。コマンドラインから簡単にkintoneスペースを管理できます。

# manage-space.js

Node.jsスクリプトを使用して、kintoneのスペースの作成、更新、表示、および削除を自動化します。コマンドラインから簡単にkintoneスペースを管理できます。

## 機能

- kintoneスペースの作成
- 既存のkintoneスペースの更新
- kintoneスペースに関する情報の表示
- kintoneスペースの削除
- 通常のスペースとゲストスペースの両方をサポート

## 前提条件

- Node.jsおよびnpmがインストールされていること
- kintoneアカウント

## インストール

1. リポジトリをクローンします：

    ```bash
    git clone https://github.com/rex0220/kintone-manage-space.git
    cd kintone-manage-space
    ```

2. 依存関係をインストールします：

    ```bash
    npm install
    ```

## 環境変数

### .envファイルを使用する場合

プロジェクトディレクトリに `.env` ファイルを作成し、kintoneの資格情報を追加します：

```plaintext
KINTONE_DOMAIN=your_domain
KINTONE_USERNAME=your_username
KINTONE_PASSWORD=your_password
```

### 環境変数を直接設定する場合

#### Windows (PowerShell)

```powershell
$env:KINTONE_DOMAIN="your_domain"
$env:KINTONE_USERNAME="your_username"
$env:KINTONE_PASSWORD="your_password"
```

#### Mac (ターミナル)

```bash
export KINTONE_DOMAIN="your_domain"
export KINTONE_USERNAME="your_username"
export KINTONE_PASSWORD="your_password"
```

## 使用方法

### オプション

| オプション | エイリアス | 型 | 説明 |
|------------|------------|----|------|
| --domain | -d | string | kintoneのドメイン |
| --username | -u | string | kintoneのユーザー名 |
| --password | -p | string | kintoneのパスワード |
| --envfile | -e | string | .envファイルのパス |
| --spaceId | -i | string | 既存のスペースID（更新、表示、削除に必要） |
| --spaceName | -s | string | スペースの名前（作成に必要） |
| --fixedMember | -f | boolean | スペースのメンバー固定（デフォルト: null） |
| --createAppPermission | -c | string | アプリ作成権限（EVERYONEまたはADMIN） |
| --guest | -g | boolean | ゲストスペースの指定（デフォルト: false） |
| --templateId | -t | string | スペースのテンプレートIDの指定 |
| --action | -a | string | 操作の種類（create, update, show, delete） |

### 例

#### .envファイルを使用する場合

##### スペースの作成

```bash
node manage-space.js -e .env -a create -s "新しいスペース" -f true -c EVERYONE
```

##### スペース情報の表示

```bash
node manage-space.js -e .env -a show -i 123
```

##### スペースの更新

```bash
node manage-space.js -e .env -a update -i 123 -s "更新されたスペース名" -c ADMIN
```

##### スペースの削除

```bash
node manage-space.js -e .env -a delete -i 123
```

#### 環境変数を直接設定する場合

##### スペースの作成

```bash
node manage-space.js -a create -s "新しいスペース" -f true -c EVERYONE
```

##### スペース情報の表示

```bash
node manage-space.js -a show -i 123
```

##### スペースの更新

```bash
node manage-space.js -a update -i 123 -s "更新されたスペース名" -c ADMIN
```

##### スペースの削除

```bash
node manage-space.js -a delete -i 123
```

## 貢献

貢献は大歓迎です！改善点やバグ修正のためにissueを作成するか、プルリクエストを提出してください。

## ライセンス

このプロジェクトはMITライセンスの下でライセンスされています。
