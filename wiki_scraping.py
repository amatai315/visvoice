import bs4
import requests
import sys
import re
import json
import codecs

test = []
title_list = []
flag = 0
url = "https://ja.wikipedia.org/wiki/" + "沢城みゆき"
res = requests.get(url)
soup = bs4.BeautifulSoup(res.text, "html.parser")
jenre = soup.select("h3 > .mw-headline")
data = soup.select("dl")
data2 = soup.select("dl > dd > ul")
data3 = soup.select("dl > dd > ul>li")
data4 = soup.select(".mw-parser-output > ul")
h4_kazu = soup.select(".mw-parser-output >h4")
# print(data4[0].text)

# print(len(data))
year_count = 0
count2 = 0
result = {}
result["沢城みゆき"] = []
count_jenre = 0
for i in range(len(jenre)):
    if jenre[i].string == "テレビアニメ" or jenre[i].string == "吹き替え" or jenre[i].string == "テレビ番組" or jenre[i].string == "ナレーション":
        flag = 1
        # print(jenre[i].string)
        count = 0
        if len(data) >= year_count:
            for j in data[year_count].find_all("dt"):  # year
                # print(j.text)
                for t in data2[count].find_all("li"):
                    t = t.find("a")
                    if "title" in t.attrs:
                        template = {}
                        a = data3[count2].text
                        a = re.split('[（]', a)
                        # print(a[0], a[1].replace("）", ""))
                        template["jenre"] = jenre[i].string
                        template["title"] = a[0]
                        template["character"] = a[1].replace("）", "")
                        result["沢城みゆき"].append(template)
                        count2 += 1

                count += 1
    if flag:
        year_count += 1
    if jenre[i].string == "吹き替え":
        hukikae_count = 0
        while hukikae_count < len(h4_kazu):
            for k in data4[count_jenre-len(data)].find_all("li"):
                # k = k.find("a")
                if k is not None:
                    a = k.text
                    a = re.split('[（]', a)
                    if len(a) == 2:
                        template = {}
                        template["jenre"] = jenre[i].string
                        template["title"] = a[0]
                        template["character"] = a[1].replace("）", "")
                        result["沢城みゆき"].append(template)
                        # print(a)
            count_jenre += 1
            hukikae_count += 1
    if jenre[i].string == "テレビ番組" or jenre[i].string == "ナレーション":
        # print(data4[count_jenre-len(data)-1].text)  # 専用処理
        for k in data4[count_jenre-len(data)].find_all("li"):
            a = k.text
            a = re.split('[（]', a)
            template = {}
            template["jenre"] = jenre[i].string
            template["title"] = a[0]
            template["info"] = a[1].replace("）", "")
            result["沢城みゆき"].append(template)

    count_jenre += 1


fw = codecs.open('data.json', 'w', 'utf-8')
json.dump(result, fw, indent=3, ensure_ascii=False)
