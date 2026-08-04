// ===============================
// Cloud Sync（複数端末での自動同期）
// ===============================

const SYNC_ID_KEY = "itpassport400_syncId";

let syncEnabled = false;

let syncDb = null;

// -------------------------------
// 同期コードの取得・生成
// -------------------------------

function getSyncCode() {

    let code =
        localStorage.getItem(SYNC_ID_KEY);

    if (!code) {

        code = generateSyncCode();

        localStorage.setItem(SYNC_ID_KEY, code);

    }

    return code;

}

function generateSyncCode() {

    // 見間違えやすい文字（0/O、1/I など）を除いた文字セット
    const chars =
        "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

    let code = "";

    for (let i = 0; i < 8; i++) {

        code +=
            chars[Math.floor(Math.random() * chars.length)];

    }

    return code;

}

function setSyncCode(code) {

    const cleaned =
        code.trim().toUpperCase();

    localStorage.setItem(SYNC_ID_KEY, cleaned);

    return cleaned;

}

// -------------------------------
// Firebase 初期化
// -------------------------------

function initSync() {

    if (
        typeof firebase === "undefined" ||
        typeof firebaseConfig === "undefined" ||
        firebaseConfig.apiKey === "ここに書き換える"
    ) {

        console.warn(
            "クラウド同期は未設定です（js/firebaseConfig.js を確認してください）"
        );

        return false;

    }

    try {

        if (!firebase.apps.length) {

            firebase.initializeApp(firebaseConfig);

        }

        syncDb = firebase.firestore();

        syncEnabled = true;

        return true;

    } catch (e) {

        console.warn("クラウド同期の初期化に失敗しました", e);

        return false;

    }

}

// -------------------------------
// クラウドへ保存
// -------------------------------

async function pushProgressToCloud(progress) {

    if (!syncEnabled) return;

    try {

        const code = getSyncCode();

        await syncDb.collection("progress")
            .doc(code)
            .set(progress);

    } catch (e) {

        console.warn("クラウドへの保存に失敗しました", e);

    }

}

// -------------------------------
// クラウドから取得
// -------------------------------

async function pullProgressFromCloud() {

    if (!syncEnabled) return null;

    try {

        const code = getSyncCode();

        const doc =
            await syncDb.collection("progress")
                .doc(code)
                .get();

        if (doc.exists) {

            return doc.data();

        }

        return null;

    } catch (e) {

        console.warn("クラウドからの取得に失敗しました", e);

        return null;

    }

}

// -------------------------------
// ページ読み込み時の同期処理
// -------------------------------
//
// ローカルのデータをすぐに表示しつつ、裏側でクラウドと比較する。
// クラウド側の方が新しければ、ローカルへ反映してページを再読み込みする。

async function syncOnLoad(onUpdated) {

    const initialized = initSync();

    if (!initialized) return;

    const local = loadProgress();

    const cloud = await pullProgressFromCloud();

    if (!cloud) {

        // クラウドにまだデータが無ければ、ローカルの内容を初回アップロード
        pushProgressToCloud(local);

        return;

    }

    const localTime = local.updatedAt || 0;

    const cloudTime = cloud.updatedAt || 0;

    if (cloudTime > localTime) {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(cloud)
        );

        if (typeof onUpdated === "function") {

            onUpdated();

        }

    } else if (localTime > cloudTime) {

        pushProgressToCloud(local);

    }

}

// -------------------------------
// 同期コードを切り替えて再連携する
// -------------------------------

async function relinkSyncCode(newCode, onDone) {

    setSyncCode(newCode);

    initSync();

    const cloud = await pullProgressFromCloud();

    if (cloud) {

        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(cloud)
        );

    }

    if (typeof onDone === "function") {

        onDone(!!cloud);

    }

}
