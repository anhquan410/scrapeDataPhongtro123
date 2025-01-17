const scrapers = require("./scraper");
const fs = require("fs");

const scrapeController = async (browserInstance) => {
  const url = "https://phongtro123.com/";
  const indexes = [1, 2, 3, 4];

  try {
    let browser = await browserInstance;
    //gọi hàm cào ở file scrape
    const categories = await scrapers.scrapeCategory(browser, url);
    const selectedCategories = categories.filter((category, index) =>
      indexes.some((i) => i === index)
    );

    let result1 = await scrapers.scraper(browser, selectedCategories[0].link);
    fs.writeFile("chothuenhanguyencan.json", JSON.stringify(result1), (err) => {
      if (err) console.log("Ghi data vào file JSON thất bại !" + err);
      console.log("Thêm data thành công.");
    });

    let result2 = await scrapers.scraper(browser, selectedCategories[1].link);
    fs.writeFile("chothuecanhochungcu.json", JSON.stringify(result2), (err) => {
      if (err) console.log("Ghi data vào file JSON thất bại !" + err);
      console.log("Thêm data thành công.");
    });

    let result3 = await scrapers.scraper(browser, selectedCategories[2].link);
    fs.writeFile("chothuecanhomini.json", JSON.stringify(result3), (err) => {
      if (err) console.log("Ghi data vào file JSON thất bại !" + err);
      console.log("Thêm data thành công.");
    });

    let result4 = await scrapers.scraper(browser, selectedCategories[3].link);
    fs.writeFile("chothuecanhodichvu.json", JSON.stringify(result4), (err) => {
      if (err) console.log("Ghi data vào file JSON thất bại !" + err);
      console.log("Thêm data thành công.");
    });
    await browser.close();
  } catch (e) {
    console.log("Lỗi ở scrape controller" + e);
  }
};

module.exports = scrapeController;
