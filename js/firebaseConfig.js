// ===============================
// Firebase 設定ファイル
// ===============================
//
// このファイルは、あなた専用のクラウド同期の「接続先情報」を書き込む場所です。
//
// 【設定手順】
// 1. https://console.firebase.google.com/ を開き、Googleアカウントでログイン
// 2. 「プロジェクトを追加」→ 好きな名前（例：itpassport400）を入力して作成
//    （Googleアナリティクスは「無効にする」でOKです）
// 3. 作成後、プロジェクトのトップ画面で「</>」（ウェブアプリを追加）をクリック
// 4. アプリのニックネームを適当に入力して「アプリを登録」
// 5. 表示された「firebaseConfig = { ... }」の中身を、下の firebaseConfig にそのまま貼り付ける
// 6. 左メニューの「構築」→「Firestore Database」→「データベースを作成」
//    → ロケーションは asia-northeast1（東京）などお好みで → 
//    「テストモードで開始」を選択して作成
// 7. 作成後、「ルール」タブを開き、以下の内容に書き換えて「公開」する
//    （ログイン無しで使うための最低限のルールです）
//
//    rules_version = '2';
//    service cloud.firestore {
//      match /databases/{database}/documents {
//        match /progress/{syncId} {
//          allow read, write: if true;
//        }
//      }
//    }
//
// 8. このファイルを保存して、GitHubにアップロード（プッシュ）すれば完了です。
//
// ※ このルールは「同期コードを知っていれば誰でも読み書きできる」設定です。
//    同期コードは他人に教えない限り推測されにくいランダムな文字列なので、
//    個人の学習アプリとして使う分には十分な安全性ですが、
//    重要な機密情報の保存には使わないでください。

const firebaseConfig = {

    apiKey: "AIzaSyDfRTkO5VWaA4RNACn42IebB95YcDAzFcc",
  authDomain: "it-passport-400.firebaseapp.com",
  projectId: "it-passport-400",
  storageBucket: "it-passport-400.firebasestorage.app",
  messagingSenderId: "441826256989",
  appId: "1:441826256989:web:9f596dcfff8230bc9cc5b4",

};
