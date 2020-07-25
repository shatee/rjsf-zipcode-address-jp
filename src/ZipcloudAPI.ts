import querystring from 'querystring';
import jsonp from 'jsonp';

type SearchResult = {
  zipcode: string;
  prefcode: string;
  address1: string;
  address2: string;
  address3: string;
  kana1: string;
  kana2: string;
  kana3: string;
};

type SearchResponse = {
  status: number;
  message?: string;
  results: SearchResult[];
};

export const ZipcloudAPI = {
  search(zipcode: string, limit?: number) {
    return new Promise<SearchResult>((resolve, reject) => {
      const cb = (error: Error | null, response: SearchResponse) => {
        if (error) {
          return reject(error.message ? error : new Error('現在検索を利用できません。'));
        }
        if (response.message) {
          return reject(new Error(response.message));
        }
        if (response.results === null) {
          return reject(new Error('住所が見つかりません。'));
        }
        resolve(response.results[0]);
      };
      jsonp(
        `https://zipcloud.ibsnet.co.jp/api/search?${querystring.stringify({
          zipcode,
          limit,
        })}`,
        cb,
      );
    });
  },
};
