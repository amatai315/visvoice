# import csv
# import datetime
import json
import codecs
from bs4 import BeautifulSoup
import requests
import sys
import time

famous_seiyuu = []
urls = ["https://ranking.net/rankings/best-male-voice-actor",
        "https://ranking.net/rankings/best-female-voice-actor"]
for url in urls:
    url = requests.get(url)
    soup = BeautifulSoup(url.content, "html.parser")
    seiyuu_list = soup.select(".p-ranking-all-rank > ol > li > a ", limit=50)
    for i in seiyuu_list:
        famous_seiyuu.append(i.text)

top_char_b = ["a", "i", "u", "e", "o"]
top_char_s = ["", "k", "s", "t", "n", "h", "m", "y", "r", "w"]
top_char = []
for shiin in top_char_s:
    for boin in top_char_b:
        if((shiin == "y" and (boin == "i" or boin == "e")) or ((shiin == "w") and boin != "a")):
            continue
        top_char.append(shiin + boin)

url_names = []
for link in top_char:
    url_names.append(
        "https://sakuhindb.com/anime/alph_info/j/people_voice_" + link+".html")

url_name = {}
count = 0
for urlName in url_names:
    url = requests.get(urlName)
    soup = BeautifulSoup(url.content, "html.parser")

    all_man = soup.find_all(attrs={"class": ["man", "female"]})
    for actor in all_man:
        tag = actor.parent['href']
        name = actor.contents[0]
        url_name[name] = "https://sakuhindb.com/" + tag
        # print("https://sakuhindb.com/" + tag, name)


data_json = {}
for i in url_name.values():
    urlName = i
    print(urlName)
    url = requests.get(urlName)
    soup = BeautifulSoup(url.content, "html.parser")
    while True:
        actor_name = soup.find("h1").text
        actor_name = actor_name.split(":")[0]
        if actor_name not in famous_seiyuu:
            break
        if actor_name not in data_json.keys():
            data_json[actor_name] = []
        if soup.find(attrs={"class": "lk_th"}, text="ID") != None:
            actor_data_list = soup.find(
                attrs={"class": "lk_th"}, text="ID").parent.next_siblings
            for actor_data in actor_data_list:
                template = {}
                template["jenre"], template["title"], template["character"], template["year"] = actor_data.contents[2].contents[
                    0], actor_data.contents[3].contents[0].contents[0], actor_data.contents[8].contents[0], actor_data.contents[1].contents[0]
                data_json[actor_name].append(template)
        if soup.find(
                attrs={"class": "lk_th"}, text="ID") == None:
            break
        next_link_tag = soup.find(
            attrs={"class": "lk_th"}, text="ID").parent.parent.next_sibling
        if next_link_tag != None:
            if next_link_tag.get("href") != None:
                time.sleep(3)
                next_link = "https://sakuhindb.com" + next_link_tag.get("href")
                url = requests.get(next_link)
                soup = BeautifulSoup(url.content, "html.parser")
            else:
                break
        else:
            break
fw = codecs.open('../data/voice_actors.json', 'w', 'utf-8')
json.dump(data_json, fw, indent=3, ensure_ascii=False)
