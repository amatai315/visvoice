import csv
import json
import codecs
from bs4 import BeautifulSoup
import requests
import time

actor_number_starting_scraping = 0

top_char_b =["a","i","u","e","o"]
top_char_s =["", "k","s","t","n","h","m","y","r","w"]
top_char = []
for shiin in top_char_s:
    for boin in top_char_b:    
        if((shiin == "y" and (boin == "i" or boin == "e")) or ((shiin =="w") and boin != "a" )):
            continue
        top_char.append(shiin + boin)
        
url_names = []
for link in  top_char:
    url_names.append("https://sakuhindb.com/anime/alph_info/j/people_voice_" +link+".html")

actor_urls = []
all_actor_number = 0

for urlName in url_names:
    url = requests.get(urlName)
    soup = BeautifulSoup(url.content, "html.parser")
    
    all_man = soup.find_all(attrs = {"class":["man","female","no_sex"]})
    for actor in all_man:
        tag = actor.parent['href']
        name = actor.contents[0]
        actor_urls.append("https://sakuhindb.com/" +tag)
        all_actor_number += 1
    print(f"get {all_actor_number} actor's URL")

# json形式
# data_json = {}
# csvファイルのpath
filename = 'data/voice_actors.csv'
if actor_number_starting_scraping == 0:
    with open(filename, 'a', encoding='UTF-8') as f:
        writer = csv.writer(f)
        writer.writerow(['name', 'jenre', 'title', 'character', 'year'])

current_number = 0

for actor_url in actor_urls:
    print(f"{current_number}/{all_actor_number} done")
    current_number += 1

    #途中で取得失敗したときのためのメニュー
    if current_number < actor_number_starting_scraping:
        continue

    url = requests.get(actor_url)
    soup = BeautifulSoup(url.content, "html.parser")

    while True:
        actor_name = soup.find("h1").text
        actor_name = actor_name.split(":")[0]
        # if actor_name not in data_json.keys():
        #     data_json[actor_name] = []
        if not soup.find(attrs={"class": "lk_th"}, text="ID"):
            break
        actor_data_list = soup.find(
            attrs={"class": "lk_th"}, text="ID").parent.next_siblings
        for actor_data in actor_data_list:
            if not actor_data.contents[3].contents[0].contents:
                continue
            with open(filename, 'a', newline="", encoding='UTF-8') as f:
                writer = csv.writer(f)
                writer.writerow([actor_name, actor_data.contents[2].contents[0],
                                actor_data.contents[3].contents[0].contents[0], actor_data.contents[8].contents[0], actor_data.contents[1].contents[0]])
            # template = {}
            # template["jenre"], template["title"], template["character"], template["year"] = actor_data.contents[2].contents[
            #     0], actor_data.contents[3].contents[0].contents[0], actor_data.contents[8].contents[0], actor_data.contents[1].contents[0]
            # data_json[actor_name].append(template)

        if not soup.find(attrs={"class": "lk_th"}, text="ID").parent.parent.next_sibling:
            break
        next_link_tag = soup.find(attrs={"class": "lk_th"}, text="ID").parent.parent.next_sibling
        if next_link_tag.get("href"):
            time.sleep(3)
            next_link = "https://sakuhindb.com" + next_link_tag.get("href")
            url = requests.get(next_link)
            soup = BeautifulSoup(url.content, "html.parser")
        else:
            # fw = codecs.open('data/voice_actors.json', 'a', 'utf-8')
            # json.dump(data_json, fw, indent=3, ensure_ascii=False)
            break

print("all process done")