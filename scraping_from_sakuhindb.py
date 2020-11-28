import sys
import time
sys.path.append('/usr/local/lib/python3.9/site-packages')
import requests
from bs4 import BeautifulSoup

urlName = "https://sakuhindb.com/tj/6_BBD2B0C2C9F0BFCD/"
url = requests.get(urlName)
soup = BeautifulSoup(url.content, "html.parser")

while True:
    actor_data_list = soup.find(attrs={"class":"lk_th"}, text="ID").parent.next_siblings
    for actor_data in actor_data_list:
        print(f"{actor_data.contents[2].contents[0]},{actor_data.contents[3].contents[0].contents[0]},{actor_data.contents[8].contents[0]}")
    
    next_link_tag = soup.find(attrs={"class":"lk_th"}, text="ID").parent.parent.next_sibling
    if next_link_tag :
        time.sleep(3)
        next_link = "https://sakuhindb.com" + next_link_tag.get("href")
        url = requests.get(next_link)
        soup = BeautifulSoup(url.content, "html.parser")
    else :
        break