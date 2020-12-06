import csv

minimum_character_num = 100
export_lines = []

with open("./data/voice_actors.csv") as f:
    reader = csv.DictReader(f)
    index = 0
    lines = [row for row in reader]
    length = len(lines)
    while index < length - minimum_character_num:
        print(index)
        if lines[index]["name"] != lines[index + minimum_character_num - 1]["name"]:
            index += 1
            continue
        while lines[index]["name"] == lines[index + 1]["name"]:
            export_lines.append(lines[index])
            index += 1
        index += 1

with open("data/voice_actors_selected_greater_than_100characters.csv", "a") as f:
    writer = csv.writer(f)
    writer.writerow(["name","jenre","title","character","year"])
    for row in export_lines:
        print(row)
        writer.writerow([row["name"],row["jenre"],row["title"],row["character"],row["year"]])