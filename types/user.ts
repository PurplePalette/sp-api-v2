import { LevelInfo } from 'sonolus-express'

export default interface User {
    /**
    * FirebaseDatabase上のユーザーID
    */
    'userId': string;
    /**
    * テスト用サーバーのエンドポイント
    */
    'testId': string;
    /**
    * 管理者か否か
    */
    'isAdmin': boolean;
    /**
    * アカウント削除フラグ(trueで削除済み扱い)
    */
    'isDeleted': boolean;
    /**
    * トータル譜面数
    */
    'totalFumen': number;
    /**
    * 独自要素: データを作成したエポックミリ秒(ソート用)
    */
    'createdTime': number;
    /**
    * 独自要素: データを更新したエポックミリ秒(ソート用)
    */
    'updatedTime': number;
    /**
    * 独自要素: サイト内および譜面情報欄に表示される説明文
    */
    'description': string;
}