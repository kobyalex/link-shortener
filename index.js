addEventListener("fetch", (event) => {
  event.respondWith(handleRequest(event.request));
});

const html404 = `<!DOCTYPE html>
  <body>
    <h1>404 Not Found.</h1>
    <p>The url you visit is not found.</p>
  </body>`;

/**
 * Respond with hello worker text
 * @param {Request} request
 */

async function returnHTML() {
  const html = await fetch(
    "https://cdn.jsdelivr.net/gh/kobyalex/link-shortener@main/index2.html"
  );
  /****customized index.html at main branch, easier to edit it****/

  return new Response(await html.text(), {
    headers: {
      "content-type": "text/html;charset=UTF-8",
    },
  });
}
async function randomString(len) {
  len = len || 6;
  let $chars = "ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678";
  let maxPos = $chars.length;
  let result = "";
  for (i = 0; i < len; i++) {
    result += $chars.charAt(Math.floor(Math.random() * maxPos));
  }
  return result;
}

async function checkURL(URL) {
  let str = URL;
  let Expression = /http(s)?:\/\/([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?/;
  let objExp = new RegExp(Expression);
  if (objExp.test(str) == true) {
    if (str[0] == "h") return true;
    else return false;
  } else {
    return false;
  }
}

async function handleRequest(request) {
  if (request.method === "POST") {
    const urls = await request.json();
    let urlb = JSON.parse(JSON.stringify(urls));
    longURL = urlb.longURL;
    shortURL = urlb.shortURL;

    if (shortURL == "") {
      shortURL = await randomString();
    }

    if (!(await checkURL(longURL))) {
      return new Response(" Illegal URL Detected. Please Enter a Valid URL ");
    }

    let is_exist = await URL_SPACE.get(shortURL);

    if (is_exist == null) {
      await URL_SPACE.put(shortURL, longURL);
      return new Response("Your short URL: http://localhost:8787/" + shortURL);
    } else {
      return new Response(
        " Duplicate Alias Detected. Enter a different Alias. "
      );
    }
  }

  const htmlBody = await returnHTML();

  if (request.method === "GET") {
    let shortCode = request.url.replace(/https:\/\/.+?\//g, "");
    shortCode = shortCode.replace(/http:\/\/.+?\//g, "");

    if (shortCode !== "") {
      let redirectTo = await URL_SPACE.get(shortCode);

      if (redirectTo != null) {
        return Response.redirect(redirectTo, 301);
      } else {
        return new Response(html404, {
          headers: {
            "content-type": "text/html;charset=UTF-8",
          },
          status: 404,
        });
      }
    } else {
      return new Response(htmlBody, {
        headers: { "content-type": "text/html" },
      });
    }
  }
}
