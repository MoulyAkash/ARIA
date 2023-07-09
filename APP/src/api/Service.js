// const url = `http://${manifest.debuggerHost.split(":").shift()}:6969/`;
const url = 'http://192.168.62.249:5959/';

export default class APIService {
  static async PostData(body, route) {
    try {
      Response = await fetch(url.concat(route), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          Accept: 'application/json',
        },
        body: JSON.stringify(body),
      }).then(async (res) => {
        return res;
      });
      return await Response.json();
    } catch (error) {
      return console.log(error);
    }
  }
}
