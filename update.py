import json
import gzip
import nlp2

DATA_SOURCE_LIST = ["http://ronnywang-twcompany.s3-website-ap-northeast-1.amazonaws.com/files/00000000.json.gz",
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
                    "http://ronnywang-twcompany.s3-website-ap-northeast-1.amazonaws.com/files/bussiness-90000000.json.gz"
                    ]


def readSourceData():
    result_list = []
    for SOURCE in DATA_SOURCE_LIST:
        print(SOURCE)
        file_path = nlp2.download_file(SOURCE, "./cache/")
        print(file_path)
        with gzip.open(file_path, 'rt', encoding='utf-8') as fp:
            line = fp.readline()
            
            while line:
                target_string = line.split(',', 1)[1]
                target_json = json.loads(target_string)
                if "上頂醫學影像" in line:
                    print(line)
                    print('公司狀況' in target_json and target_json['公司狀況'] == '核准設立')
                    print('代表人姓名' in target_json and target_json['代表人姓名'] != "")
                if '公司狀況' in target_json and target_json['公司狀況'] == '核准設立':
                    if '代表人姓名' in target_json and target_json['代表人姓名'] != "":
                        temp_dict = {
                            "id": target_json["id"],
                            "公司名稱": target_json["公司名稱"],
                            "資本總額": target_json["資本總額(元)"],
                            "代表人姓名": target_json["代表人姓名"],
                            "公司所在地": target_json["公司所在地"],
                            "董監事名單": target_json["董監事名單"]
                        }
                        result_list.append(temp_dict)
                line = fp.readline()
    return result_list


def calculateNames(json_list):
    names_dict = {}
    for company in json_list:
        for directors_list in company['董監事名單']:
            if "缺" not in directors_list['姓名'] and "解任" not in directors_list['姓名']:
                if directors_list['姓名'] not in names_dict:
                    names_dict[directors_list['姓名']] = 1
                else:
                    names_dict[directors_list['姓名']] += 1

    sorted_dict = {k: v for k, v in sorted(names_dict.items(), key=lambda item: item[1], reverse=True)}
    return sorted_dict


def caculateLegalPerson(json_list):
    names_dict = {}
    for company in json_list:
        for directors_list in company['董監事名單']:
            if directors_list['所代表法人'] != "":
                if directors_list['所代表法人'][1] not in names_dict:
                    names_dict[directors_list['所代表法人'][1]] = 1
                else:
                    names_dict[directors_list['所代表法人'][1]] += 1


    sorted_dict = {k: v for k, v in sorted(names_dict.items(), key=lambda item: item[1], reverse=True)}
    return sorted_dict


def saveJson(data, file_name):
    with open(file_name, 'w', encoding='utf-8') as fp:
        json.dump(data, fp, ensure_ascii=False)


if __name__ == "__main__":
    save_file_name = './src/assets/data/graph.json'
    data_list = readSourceData()
    print('total count company:', len(data_list))
    legal_persons = caculateLegalPerson(data_list)

    graph_dict = {}
    for key in legal_persons.keys():
        graph_dict[key] = {'id': '', '資本總額': 0, '代表人姓名': '', '公司所在地': '', 'in': [], 'out': []}

    for company in data_list:
        company_name = company['公司名稱']
        if company_name not in graph_dict:
            graph_dict[company_name] = {'id': '', '資本總額': 0, '代表人姓名': '', '公司所在地': '', 'in': [], 'out': []}

        graph_dict[company_name]['id'] = company['id']
        graph_dict[company_name]['資本總額'] = int('0' + company['資本總額'].replace(',', ''))
        graph_dict[company_name]['代表人姓名'] = company['代表人姓名']
        graph_dict[company_name]['公司所在地'] = company['公司所在地']
        for investor in company['董監事名單']:
            if investor['所代表法人'] != '' and investor['所代表法人'][1] in graph_dict:
                investor_name = investor['所代表法人'][1]
                if investor_name not in graph_dict[company_name]['in']:
                    graph_dict[company_name]['in'].append(investor_name)
                if company_name not in graph_dict[investor_name]['out']:
                    graph_dict[investor_name]['out'].append(company_name)

    saveJson(graph_dict, save_file_name)
