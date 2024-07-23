/**
 * manage_space.js
 * Created by rex0220
 * 
 * このスクリプトは、kintoneのスペースを作成、更新、表示、削除するためのツールです。
 * スペース管理を自動化し、CLIから簡単に操作できます。
 */
const axios = require('axios');
const yargs = require('yargs');
const fs = require('fs');
const readline = require('readline');
const { red, blue } = require('kleur');
require('dotenv').config();

// コマンドライン引数のパース
const argv = yargs
    .option('domain', {
        alias: 'd',
        type: 'string',
        description: 'kintoneのドメイン'
    })
    .option('username', {
        alias: 'u',
        type: 'string',
        description: 'kintoneのユーザー名'
    })
    .option('password', {
        alias: 'p',
        type: 'string',
        description: 'kintoneのパスワード'
    })
    .option('envfile', {
        alias: 'e',
        type: 'string',
        description: '.envファイルのパス'
    })
    .option('spaceId', {
        alias: 'i',
        type: 'string',
        description: '既存のスペースID（指定時、ユーザーにはスペース管理権限が必要）'
    })
    .option('spaceName', {
        alias: 's',
        type: 'string',
        description: 'スペースの名前'
    })
    .option('fixedMember', {
        alias: 'f',
        type: 'boolean',
        description: 'スペースメンバーの固定',
        default: null
    })
    .option('createAppPermission', {
        alias: 'c',
        type: 'string',
        description: 'アプリ作成権限（EVERYONE または ADMIN）',
        choices: ['EVERYONE', 'ADMIN']
    })
    .option('guest', {
        alias: 'g',
        type: 'boolean',
        description: 'ゲストスペースの指定',
        default: false
    })
    .option('templateId', {
        alias: 't',
        type: 'string',
        description: 'スペーステンプレートIDの指定'
    })
    .option('action', {
        alias: 'a',
        type: 'string',
        description: '操作の種類（create, update, show, delete）',
        choices: ['create', 'update', 'show', 'delete'],
        demandOption: false
    })
    .check((argv) => {
        if (argv.help) return true;  // ヘルプ表示時にはチェックをスキップ
        if (argv.envfile) {
            if (!fs.existsSync(argv.envfile)) {
                throw new Error(red(`指定された.envファイルが見つかりません: ${argv.envfile}`));
            }
            require('dotenv').config({ path: argv.envfile });
        }
        if (!argv.domain && !process.env.KINTONE_DOMAIN) {
            throw new Error(red('ドメインを指定するか、環境変数KINTONE_DOMAINを設定してください。'));
        }
        if (!argv.username && !process.env.KINTONE_USERNAME) {
            throw new Error(red('ユーザー名を指定するか、環境変数KINTONE_USERNAMEを設定してください。'));
        }
        if (!argv.password && !process.env.KINTONE_PASSWORD) {
            throw new Error(red('パスワードを指定するか、環境変数KINTONE_PASSWORDを設定してください。'));
        }
        if (!argv.action) {
            throw new Error(red('操作の種類を指定するためにactionオプションを使用してください（create, update, show, delete）。'));
        }
        if (argv.action === 'create' && !argv.spaceName && !argv.templateId) {
            throw new Error(red('スペースを作成するにはspaceNameまたはtemplateIdを指定してください。'));
        }
        if (argv.guest && argv.action === 'create' && !argv.templateId) {
            throw new Error(red('ゲストスペースを作成するにはtemplateIdを指定してください。'));
        }
        if ((argv.action === 'update' || argv.action === 'show' || argv.action === 'delete') && !argv.spaceId) {
            throw new Error(red('スペースを更新、表示、または削除するにはspaceIdを指定してください。'));
        }
        return true;
    })
    .help()
    .epilogue('操作の種類に応じて、スペースの作成、更新、表示、または削除を行います。\n' +
              '操作の種類はactionオプションで指定してください（create, update, show, delete）。')
    .argv;

const domain = argv.domain || process.env.KINTONE_DOMAIN;
const username = argv.username || process.env.KINTONE_USERNAME;
const password = argv.password || process.env.KINTONE_PASSWORD;
const spaceId = argv.spaceId;
const spaceName = argv.spaceName;
const fixedMember = argv.fixedMember;
const createAppPermission = argv.createAppPermission;
const guest = argv.guest;
const templateId = argv.templateId;
const action = argv.action;

// ベーシック認証のための認証情報
const auth = Buffer.from(`${username}:${password}`).toString('base64');
const headers = {
    'X-Cybozu-Authorization': auth,
    'Content-Type': 'application/json'
};

// APIのURLを決定する関数
const getApiUrl = (path) => {
    if (guest && action === 'create') {
        return `/k/v1${path}`;
    }
    if (guest) {
        return `/k/guest/${spaceId}/v1${path}`;
    }
    return `/k/v1${path}`;
};

// Axiosインスタンスの作成（POST、PUT、DELETE、GET用）
const kintone = axios.create({
    baseURL: `https://${domain}`,
    headers: headers
});

// エラーの詳細を表示する関数
const displayError = (error) => {
    if (error.response) {
        console.error(red(`Error status: ${error.response.status}`));
        console.error(red(`Error data: ${JSON.stringify(error.response.data, null, 2)}`));
        console.error(red(`Request data: ${JSON.stringify(error.config.data, null, 2)}`));
        console.error(red(`Request headers: ${JSON.stringify(error.config.headers, null, 2)}`));
    } else {
        console.error(red(`Error message: ${error.message}`));
    }
};

// スペース情報の表示
const showSpaceInfo = async (spaceId) => {
    console.log(`スペースID「${spaceId}」の情報を表示しています...`);
    try {
        const spaceResponse = await kintone.get(getApiUrl('/space.json'), {
            data: { id: spaceId }
        });
        const spaceInfo = spaceResponse.data;
        console.log('スペース情報:');
        console.log(`  スペース名: ${spaceInfo.name}`);
        console.log(`  スペースID: ${spaceInfo.id}`);
        console.log(`  ゲストスペース: ${guest ? 'はい' : 'いいえ'}`);
        console.log(`  スペースの状態: ${spaceInfo.isPrivate ? '非公開' : '公開'}`);
        console.log(`  メンバー固定: ${spaceInfo.fixedMember ? 'はい' : 'いいえ'}`);
        console.log(`  アプリ作成権限: ${spaceInfo.permissions.createApp}`);
        if (spaceInfo.creator) {
            console.log(`  作成者: ${spaceInfo.creator.name} (${spaceInfo.creator.code})`);
        }
        if (spaceInfo.modifier) {
            console.log(`  更新者: ${spaceInfo.modifier.name} (${spaceInfo.modifier.code})`);
        }

        // スペース内のアプリ情報を表示
        const apps = spaceInfo.attachedApps;
        if (apps && apps.length > 0) {
            console.log('  スペース内のアプリ:');
            apps.forEach((app, index) => {
                console.log(`    ${index + 1}. ${app.name} (ID: ${app.appId})`);
            });
        } else {
            console.log('  スペース内のアプリはありません。');
        }

        return spaceInfo; // スペース情報を返す
    } catch (error) {
        displayError(error);
        process.exit(1);
    }
};

// スペースの作成
const createSpace = async () => {
    console.log(`スペース「${spaceName}」を作成しています...`);
    try {
        const createPath = templateId ? '/template/space.json' : '/space.json';
        const requestBody = {
            name: spaceName,
            isPrivate: false,
            fixedMember: fixedMember,
            permissions: {
                createApp: createAppPermission
            },
            members: [
                {
                    entity: {
                        type: 'USER',
                        code: username
                    },
                    isAdmin: true
                }
            ]
        };

        if (templateId) {
            requestBody.id = templateId;
        }

        if (guest) {
            requestBody.isGuest = true;
        }

        const spaceResponse = await kintone.post(getApiUrl(createPath), requestBody);
        const newSpaceId = spaceResponse.data.id;
        console.log(`作成されたスペース「${spaceName}」のID: ${newSpaceId}`);
        return newSpaceId;
    } catch (error) {
        displayError(error);
        process.exit(1);
    }
};

// スペースの更新
const updateSpace = async (spaceId) => {
    if (fixedMember === null && createAppPermission === undefined && !spaceName) {
        console.error(red('更新項目が指定されていません。spaceName、fixedMemberまたはcreateAppPermissionを指定してください。'));
        return;
    }

    console.log(`スペースID「${spaceId}」を更新しています...`);
    const updateData = {
        id: spaceId
    };

    if (fixedMember !== null) {
        updateData.fixedMember = fixedMember;
    }

    if (createAppPermission !== undefined) {
        updateData.permissions = {
            createApp: createAppPermission
        };
    }

    if (spaceName) {
        updateData.name = spaceName;
    }

    try {
        const currentSpaceInfo = await showSpaceInfo(spaceId);

        console.log('\n更新内容:');
        if (spaceName) {
            console.log(`  スペース名: ${currentSpaceInfo.name} -> ${spaceName}`);
        }
        if (fixedMember !== null) {
            console.log(`  メンバー固定: ${currentSpaceInfo.fixedMember ? 'はい' : 'いいえ'} -> ${fixedMember ? 'はい' : 'いいえ'}`);
        }
        if (createAppPermission !== undefined) {
            console.log(`  アプリ作成権限: ${currentSpaceInfo.permissions.createApp} -> ${createAppPermission}`);
        }

        const confirmed = await confirmAction('このスペースを更新してもよろしいですか？ (yes/no): ');
        if (confirmed) {
            await kintone.put(getApiUrl('/space.json'), updateData);
            console.log(`スペースID「${spaceId}」が正常に更新されました。`);
        } else {
            console.log('スペースの更新をキャンセルしました。');
        }
    } catch (error) {
        displayError(error);
        process.exit(1);
    }
};

// ユーザーの確認を待つ関数
const confirmAction = async (message) => {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolve) => {
        rl.question(blue(message), (answer) => {
            rl.close();
            resolve(answer.toLowerCase() === 'yes');
        });
    });
};

// スペースの削除
const deleteSpace = async (spaceId) => {
    console.log(`スペースID「${spaceId}」を削除しています...`);
    try {
        await kintone.delete(getApiUrl('/space.json'), {
            data: { id: spaceId }
        });
        console.log(`スペースID「${spaceId}」が正常に削除されました。`);
    } catch (error) {
        displayError(error);
        process.exit(1);
    }
};

// メイン関数
const main = async () => {
    if (action === 'show') {
        await showSpaceInfo(spaceId);
    } else if (action === 'update') {
        await updateSpace(spaceId);
    } else if (action === 'create') {
        const newSpaceId = await createSpace();
        console.log(`スペース「${spaceName}」が正常に作成されました。ID: ${newSpaceId}`);
    } else if (action === 'delete') {
        await showSpaceInfo(spaceId);
        const confirmed = await confirmAction('このスペースを削除してもよろしいですか？ (yes/no): ');
        if (confirmed) {
            await deleteSpace(spaceId);
        } else {
            console.log('スペースの削除をキャンセルしました。');
        }
    }
};

// コマンドライン引数で渡されたパラメータを使用してメイン関数を実行
main();
