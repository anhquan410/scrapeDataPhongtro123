const scrapeCategory = async (browser, url) =>
  new Promise(async (resolve, reject) => {
    try {
      let page = await browser.newPage();
      console.log(">> Mở tab mới ...");
      await page.goto(url);
      console.log("Truy cập vào" + url);

      await page.waitForSelector("#webpage");
      console.log(">> Website đã load xong...");

      const dataCategory = await page.$$eval(".pt123__nav > ul > li", (els) => {
        dataCategory = els.map((el) => {
          return {
            category: el.querySelector("a").innerText,
            link: el.querySelector("a").href,
          };
        });
        return dataCategory;
      });
      //   console.log(dataCategory);
      //   console.log(">> Tab đã đóng");

      await page.close();

      resolve(dataCategory);
    } catch (error) {
      console.log("Lỗi ở scrape category" + error);
      reject(error);
    }
  });

const scraper = (browser, url) =>
  new Promise(async (resolve, reject) => {
    try {
      let newPage = await browser.newPage();
      console.log(">> Mở tab mới ...");
      await newPage.goto(url);
      console.log("Truy cập vào" + url);
      await newPage.waitForSelector("main");
      console.log(">> Đã load xong tag main ...");

      const scrapeData = {};

      // lấy header dataCategory
      const headerData = await newPage.$eval("main  header ", (el) => {
        return {
          title: el.querySelector("h1").innerText,
          description: el.querySelector("p").innerText,
        };
      });
      scrapeData.header = headerData;

      // lấy links detail item
      const detaillinks = await newPage.$$eval(
        "main .post__listing > li  ",
        (els) => {
          detaillinks = els.map((el) => {
            return el.querySelector("main .post__listing li h3 a").href;
          });
          return detaillinks;
        }
      );

      //   console.log(detaillinks);
      const scraperDetail = async (link) =>
        new Promise(async (resolve, reject) => {
          try {
            let pageDetail = await browser.newPage();
            await pageDetail.goto(link);
            console.log("Truy cập vào" + link);
            await pageDetail.waitForSelector("main");
            const detailData = {};
            // bắt đầu cào
            // cào ảnh
            const images = await pageDetail.$$eval(
              "main .post__photos .carousel-inner",
              (els) => {
                images = els.map((el) => {
                  return el.querySelector("img")?.src;
                });
                return images.filter((i) => !i === false);
              }
            );
            // console.log(images);
            detailData.images = images;

            // Cào header details
            const header = await pageDetail.$eval(
              "main .bg-white header",
              (el) => {
                return {
                  title: el.querySelector("h1").innerText,
                  star: el
                    .querySelector(".badge > div")
                    ?.className?.replace(/^\D+/g, ""),
                  address: el.querySelector("address ").innerText,
                  atribute: {
                    price: el.querySelector(".d-flex > .d-flex > .text-price")
                      .innerText,
                    acreage: el.querySelector(
                      ".d-flex > .d-flex > span:nth-child(3)"
                    ).innerText,
                    published: el.querySelector(".d-flex > .d-flex > time")
                      .innerText,
                    hastag: el.querySelector(
                      ".d-flex > div:nth-child(2) > span"
                    ).innerText,
                  },
                };
              }
            );
            // console.log(header);
            detailData.header = header;

            // Cào thông tin mô tả
            const mainContentHeader = await pageDetail.$eval(
              "main .bg-white.shadow-sm > .border-bottom.pb-3.mb-4 > h2",
              (el) => el.innerText
            );
            const mainContentContent = await pageDetail.$eval(
              "main .bg-white.shadow-sm > .border-bottom.pb-3.mb-4 > p",
              (el) => el.innerText
            );
            detailData.mainContent = {
              header: mainContentHeader,
              content: mainContentContent,
            };
            // console.log(detailData.mainContent);

            // Cào đặc điểm tin đăng
            const overviewHeader = await pageDetail.$eval(
              "main .col-md-9.col-lg-8 .bg-white.shadow-sm.rounded.p-4.mb-3 ",
              (el) => el.querySelector("div:nth-last-of-type(3) h2").innerText
            );
            // const overviewContent = await pageDetail.$$eval(
            //   "main .col-md-9.col-lg-8 .bg-white.shadow-sm.rounded.p-4.mb-3 ",
            //   (el) => {
            //     const datas = el.querySelector(
            //       "div:nth-last-of-type(3) .row .col-6"
            //     );
            //     return datas.map((data) => ({
            //       name: data.querySelector("div .me-2").innerText,
            //       content: data.querySelector("div .ms-2 .").innerText,
            //     }));
            //   }
            // );
            // detailData.overview = {
            //   header: overviewHeader,
            //   content: overviewContent,
            // };
            // console.log(overviewHeader);

            // console.log(overviewContent);

            // console.log(detailData.overview);

            // Cào thông tin liên hệ
            const contactHeader = await pageDetail.$eval(
              "main .col-md-9.col-lg-8 .bg-white.shadow-sm.rounded.p-4.mb-3 ",
              (el) => el.querySelector("div:nth-last-of-type(2) h2").innerText
            );
            const contactContent = await pageDetail.$eval(
              "main .col-md-9.col-lg-8 .bg-white.shadow-sm.rounded.p-4.mb-3",
              (el) => {
                return {
                  name: el.querySelector(
                    "div:nth-last-of-type(2) .d-flex .d-flex .me-2"
                  ).innerText,
                  phone: el.querySelector(
                    "div:nth-last-of-type(2) .d-flex .d-flex .btn-green i"
                  ).innerText,
                  zalo: el.querySelector(
                    "div:nth-last-of-type(2) .d-flex .d-flex .btn-green i"
                  ).innerText,
                };
              }
            );
            detailData.contact = {
              header: contactHeader,
              content: contactContent,
            };
            // console.log(contactHeader);
            // console.log(contactContent);

            // console.log(detailData.contact);

            await pageDetail.close();
            console.log(">> Đã đóng tab" + link);
            resolve(detailData);
          } catch (error) {
            console.log("Lấy data detail lỗi" + error);
            reject(error);
          }
        });
      const details = [];
      for (let link of detaillinks) {
        const detail = await scraperDetail(link);
        details.push(detail);
      }
      scrapeData.body = details;

      console.log(">> Trình duyệt đã đóng...");
      resolve(scrapeData);
    } catch (error) {
      reject(error);
    }
  });
module.exports = { scrapeCategory, scraper };
