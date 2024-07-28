# kintone-manage-space
manage-space.js: kintoneのスペースの作成、更新、表示、削除を自動化するためのNode.jsスクリプト。コマンドラインから簡単にkintoneスペースを管理できます。

# manage-space.js

A Node.js script for automating the creation, update, display, and deletion of kintone spaces. Easily manage your kintone spaces from the command line.

## Features

- Create kintone spaces
- Update existing kintone spaces
- Display information about kintone spaces
- Delete kintone spaces
- Supports both regular and guest spaces

## Prerequisites

- Node.js and npm installed
- A kintone account

## Installation

1. Clone the repository:

    ```bash
    git clone https://github.com/rex0220/kintone-manage-space.git
    cd kintone-manage-space
    ```

2. Install the dependencies:

    ```bash
    npm install
    ```

## Environment Variables

### Using a .env file

Create a `.env` file in the project directory and add your kintone credentials:

```plaintext
KINTONE_DOMAIN=your_domain
KINTONE_USERNAME=your_username
KINTONE_PASSWORD=your_password
```

### Setting Environment Variables Directly

#### Windows (PowerShell)

```powershell
$env:KINTONE_DOMAIN="your_domain"
$env:KINTONE_USERNAME="your_username"
$env:KINTONE_PASSWORD="your_password"
```

#### Mac (Terminal)

```bash
export KINTONE_DOMAIN="your_domain"
export KINTONE_USERNAME="your_username"
export KINTONE_PASSWORD="your_password"
```

## Usage

### Options

| Option | Alias | Type | Description |
|--------|-------|------|-------------|
| --domain | -d | string | kintone domain |
| --username | -u | string | kintone username |
| --password | -p | string | kintone password |
| --envfile | -e | string | Path to .env file |
| --spaceId | -i | string | Existing space ID (required for update, show, delete) |
| --spaceName | -s | string | Name of the space (required for create) |
| --fixedMember | -f | boolean | Fix members of the space (default: null) |
| --createAppPermission | -c | string | Permission to create apps (EVERYONE or ADMIN) |
| --guest | -g | boolean | Specify if it's a guest space (default: false) |
| --templateId | -t | string | Specify a template ID for the space |
| --action | -a | string | Type of action (create, update, show, delete) |

### Examples

#### Using a .env file

##### Create a Space

```bash
node manage-space.js -e .env -a create -s "New Space" -f true -c EVERYONE
```

##### Show Space Information

```bash
node manage-space.js -e .env -a show -i 123
```

##### Update a Space

```bash
node manage-space.js -e .env -a update -i 123 -s "Updated Space Name" -c ADMIN
```

##### Delete a Space

```bash
node manage-space.js -e .env -a delete -i 123
```

#### Using Environment Variables Directly

##### Create a Space

```bash
node manage-space.js -a create -s "New Space" -f true -c EVERYONE
```

##### Show Space Information

```bash
node manage-space.js -a show -i 123
```

##### Update a Space

```bash
node manage-space.js -a update -i 123 -s "Updated Space Name" -c ADMIN
```

##### Delete a Space

```bash
node manage-space.js -a delete -i 123
```

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or bug fixes.

## License

This project is licensed under the MIT License.
