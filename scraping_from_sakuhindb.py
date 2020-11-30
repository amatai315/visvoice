import csv
import datetime
import json
import codecs
from bs4 import BeautifulSoup
import requests
import sys
import time
sys.path.append('/usr/local/lib/python3.9/site-packages')

urlName = "https://sakuhindb.com/tj/6_BBD2B0C2C9F0BFCD/"
url = requests.get(urlName)
soup = BeautifulSoup(url.content, "html.parser")
# json形式
data_json = {}
# csvファイルのpath
filename = 'data/voice_actors.csv'
with open(filename, 'w', encoding='UTF-8') as f:
    writer = csv.writer(f)
    writer.writerow(['name', 'jenre', 'title', 'character', 'year'])

while True:
    actor_name = soup.find("h1").text
    actor_name = actor_name.split(":")[0]
    if actor_name not in data_json.keys():
        data_json[actor_name] = []
    actor_data_list = soup.find(
        attrs={"class": "lk_th"}, text="ID").parent.next_siblings
    for actor_data in actor_data_list:
        # print(
        #     f"{actor_data.contents[2].contents[0]},{actor_data.contents[3].contents[0].contents[0]},{actor_data.contents[8].contents[0]},{actor_data.contents[1].contents[0]}")
        with open(filename, 'a', newline="", encoding='UTF-8') as f:
            writer = csv.writer(f)
            writer.writerow([actor_name, actor_data.contents[2].contents[0],
                             actor_data.contents[3].contents[0].contents[0], actor_data.contents[8].contents[0], actor_data.contents[1].contents[0]])
        template = {}
        template["jenre"], template["title"], template["character"], template["year"] = actor_data.contents[2].contents[
            0], actor_data.contents[3].contents[0].contents[0], actor_data.contents[8].contents[0], actor_data.contents[1].contents[0]
        data_json[actor_name].append(template)

    next_link_tag = soup.find(
        attrs={"class": "lk_th"}, text="ID").parent.parent.next_sibling
    if next_link_tag:
        time.sleep(3)
        next_link = "https://sakuhindb.com" + next_link_tag.get("href")
        url = requests.get(next_link)
        soup = BeautifulSoup(url.content, "html.parser")
    else:
        fw = codecs.open('data/voice_actors.json', 'w', 'utf-8')
        json.dump(data_json, fw, indent=3, ensure_ascii=False)
        break
