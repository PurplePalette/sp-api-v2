import { LevelInfo } from 'sonolus-express'

export default interface CustomLevelInfo extends LevelInfo {
    /**
    * 独自要素: 楽曲のジャンル
    */
     'genre': string;
     /**
     * 独自要素: 楽曲が全体公開かどうか
     */
     'public': boolean;
     /**
     * 独自要素: 譜面作成者のユーザーID
     */
     'userId': string;
     /**
     * 独自要素: 譜面内のノーツ数
     */
     'notes': number;
     /**
     * 独自要素: データを作成したエポックミリ秒(ソート用)
     */
     'createdTime': number;
     /**
     * 独自要素: データを更新したエポックミリ秒(ソート用)
     */
     'updatedTime': number;
     /**
     * 独自要素: サムネのハッシュ値(DBを兼ねるため)
     */
     'coverHash': string;
     /**
     * 独自要素: データのハッシュ(DBを兼ねるため)
     */
     'dataHash': string;
     /**
     * 独自要素: BGMのハッシュ(DBを兼ねるため)
     */
     'bgmHash': string;
     /**
     * 独自要素: プレイされた回数
     */
     'playCount': number;
}

