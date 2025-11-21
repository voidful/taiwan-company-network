import gzip
import json
from typing import Any, Dict, Iterable, List

import nlp2

DATA_SOURCE_LIST = [
    "http://ronnywang-twcompany.s3-website-ap-northeast-1.amazonaws.com/files/00000000.json.gz",
    "http://ronnywang-twcompany.s3-website-ap-northeast-1.amazonaws.com/files/10000000.json.gz",
    "http://ronnywang-twcompany.s3-website-ap-northeast-1.amazonaws.com/files/20000000.json.gz",
    "http://ronnywang-twcompany.s3-website-ap-northeast-1.amazonaws.com/files/30000000.json.gz",
    "http://ronnywang-twcompany.s3-website-ap-northeast-1.amazonaws.com/files/40000000.json.gz",
    "http://ronnywang-twcompany.s3-website-ap-northeast-1.amazonaws.com/files/50000000.json.gz",
    "http://ronnywang-twcompany.s3-website-ap-northeast-1.amazonaws.com/files/60000000.json.gz",
    "http://ronnywang-twcompany.s3-website-ap-northeast-1.amazonaws.com/files/70000000.json.gz",
    "http://ronnywang-twcompany.s3-website-ap-northeast-1.amazonaws.com/files/80000000.json.gz",
    "http://ronnywang-twcompany.s3-website-ap-northeast-1.amazonaws.com/files/90000000.json.gz",
    "http://ronnywang-twcompany.s3-website-ap-northeast-1.amazonaws.com/files/bussiness-00000000.json.gz",
    "http://ronnywang-twcompany.s3-website-ap-northeast-1.amazonaws.com/files/bussiness-10000000.json.gz",
    "http://ronnywang-twcompany.s3-website-ap-northeast-1.amazonaws.com/files/bussiness-20000000.json.gz",
    "http://ronnywang-twcompany.s3-website-ap-northeast-1.amazonaws.com/files/bussiness-30000000.json.gz",
    "http://ronnywang-twcompany.s3-website-ap-northeast-1.amazonaws.com/files/bussiness-40000000.json.gz",
    "http://ronnywang-twcompany.s3-website-ap-northeast-1.amazonaws.com/files/bussiness-50000000.json.gz",
    "http://ronnywang-twcompany.s3-website-ap-northeast-1.amazonaws.com/files/bussiness-60000000.json.gz",
    "http://ronnywang-twcompany.s3-website-ap-northeast-1.amazonaws.com/files/bussiness-70000000.json.gz",
    "http://ronnywang-twcompany.s3-website-ap-northeast-1.amazonaws.com/files/bussiness-80000000.json.gz",
    "http://ronnywang-twcompany.s3-website-ap-northeast-1.amazonaws.com/files/bussiness-90000000.json.gz",
]


def read_source_data(sources: Iterable[str]) -> List[Dict[str, Any]]:
    """Download and parse raw company data from all sources."""

    result_list: List[Dict[str, Any]] = []
    for source in sources:
        print(source)
        file_path = nlp2.download_file(source, "./cache/")
        print(file_path)
        with gzip.open(file_path, "rt", encoding="utf-8") as fp:
            for line in fp:
                target_string = line.split(",", 1)[1]
                target_json = json.loads(target_string)
                if (
                    target_json.get("公司狀況") == "核准設立"
                    and target_json.get("代表人姓名")
                ):
                    result_list.append(
                        {
                            "id": target_json["id"],
                            "公司名稱": target_json["公司名稱"],
                            "資本總額": target_json["資本總額(元)"],
                            "代表人姓名": target_json["代表人姓名"],
                            "公司所在地": target_json["公司所在地"],
                            "董監事名單": target_json["董監事名單"],
                        }
                    )
    return result_list


def calculate_names(json_list: Iterable[Dict[str, Any]]) -> Dict[str, int]:
    """Count name appearances across all directors."""

    names_dict: Dict[str, int] = {}
    for company in json_list:
        for directors_list in company["董監事名單"]:
            if "缺" not in directors_list["姓名"] and "解任" not in directors_list["姓名"]:
                names_dict[directors_list["姓名"]] = (
                    names_dict.get(directors_list["姓名"], 0) + 1
                )

    return {k: v for k, v in sorted(names_dict.items(), key=lambda item: item[1], reverse=True)}


def calculate_legal_persons(json_list: Iterable[Dict[str, Any]]) -> Dict[str, int]:
    """Count appearances for legal person entities represented by directors."""

    names_dict: Dict[str, int] = {}
    for company in json_list:
        for directors_list in company["董監事名單"]:
            if directors_list["所代表法人"] != "":
                names_dict[directors_list["所代表法人"][1]] = (
                    names_dict.get(directors_list["所代表法人"][1], 0) + 1
                )

    return {k: v for k, v in sorted(names_dict.items(), key=lambda item: item[1], reverse=True)}


def normalize_capital(raw_value: str) -> int:
    """Convert capital amount string into an integer value."""

    return int("0" + raw_value.replace(",", ""))


def create_empty_node() -> Dict[str, Any]:
    """Create a default graph node structure."""

    return {"id": "", "資本總額": 0, "代表人姓名": "", "公司所在地": "", "in": [], "out": []}


def build_graph(json_list: List[Dict[str, Any]]) -> Dict[str, Dict[str, Any]]:
    """Create the relationship graph between companies and legal persons."""

    legal_persons = calculate_legal_persons(json_list)
    graph_dict: Dict[str, Dict[str, Any]] = {
        key: create_empty_node() for key in legal_persons.keys()
    }

    for company in json_list:
        company_name = company["公司名稱"]
        if company_name not in graph_dict:
            graph_dict[company_name] = create_empty_node()

        graph_dict[company_name]["id"] = company["id"]
        graph_dict[company_name]["資本總額"] = normalize_capital(company["資本總額"])
        graph_dict[company_name]["代表人姓名"] = company["代表人姓名"]
        graph_dict[company_name]["公司所在地"] = company["公司所在地"]
        for investor in company["董監事名單"]:
            if investor["所代表法人"] != "" and investor["所代表法人"][1] in graph_dict:
                investor_name = investor["所代表法人"][1]
                if investor_name not in graph_dict[company_name]["in"]:
                    graph_dict[company_name]["in"].append(investor_name)
                if company_name not in graph_dict[investor_name]["out"]:
                    graph_dict[investor_name]["out"].append(company_name)

    return graph_dict


def save_json(data: Dict[str, Any], file_name: str) -> None:
    """Persist data to a UTF-8 encoded JSON file."""

    with open(file_name, "w", encoding="utf-8") as fp:
        json.dump(data, fp, ensure_ascii=False)


if __name__ == "__main__":
    save_file_name = "./src/assets/data/graph.json"
    data_list = read_source_data(DATA_SOURCE_LIST)
    print("total count company:", len(data_list))

    graph_dict = build_graph(data_list)
    save_json(graph_dict, save_file_name)
