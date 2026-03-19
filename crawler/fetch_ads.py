import json
import os
import requests
import time
import random
from datetime import datetime, timedelta

def download_video(title, video_url, video_id, out_dir):
    if not video_url: return None
    try:
        filename = f"{video_id}.mp4"
        filepath = os.path.join(out_dir, filename)
        if os.path.exists(filepath):
            print(f"[-] 已存在, 跳过下载: {filename}")
            return filename
            
        print(f"[+] 正在下载视频 ({title[:15]}...): {filename}")
        headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
            'Accept': '*/*, video/mp4'
        }
        r = requests.get(video_url, stream=True, headers=headers, timeout=30)
        r.raise_for_status()
        with open(filepath, 'wb') as f:
            for chunk in r.iter_content(chunk_size=1024*1024):
                if chunk:
                    f.write(chunk)
        return filename
    except Exception as e:
        print(f"[!] 下载视频失败: {video_url}, 错误: {e}")
        return None

def fetch_ads():
    url = 'https://api-appgrowing-cn.youcloud.com/graphql'
    
    # Calculate dates first for dynamic headers
    today = datetime.now()
    end_date = today.strftime("%Y-%m-%d")
    start_date = (today - timedelta(days=7)).strftime("%Y-%m-%d")

    referer = f"https://appgrowing-cn.youcloud.com/brand/Q4tst59gXZJKmkpU1KB8mw==/leaflet/list?viewType=leaflet&isNew=0&resolution=0&isExact=false&order=impression_desc&startDate={start_date}&endDate={end_date}&page=1&brandType=401&genre=1&isStrict=true&isSearchAiScene=0"
    headers = {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'zh-CN,zh;q=0.9',
        'content-type': 'application/json',
        'cookie': os.getenv('APPGROWING_COOKIE', ''),
        'origin': 'https://appgrowing-cn.youcloud.com',
        'referer': referer,
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
        'x-operation-name': 'domesticLeafletList'
    }

    if not headers['cookie']:
        print("[!] 警告: 未检测到 APPGROWING_COOKIE 环境变量！")

    query = """
    query domesticLeafletList (
        $id: String
        $videoShotId: String
        $appBrand: String
        $brand: NumStr
        $dev: String
        $shop: String
        $product: String
        $landingPage: String
        $campaignId: String
        $campaignType: String
        $appCampaignId: NumStr
        $appCampaignType: String
        $keyword: String
        $accurateSearch: Int
        $outerPurpose: [Int]
        $industry: [Int]
        $gameStyle: [Int]
        $channel: [Int]
        $media: [Int]
        $startDate: LocalDate
        $endDate: LocalDate
        $isNew: Int
        $city: [Int]
        $platform: [Int]
        $format: [Int]
        $mtype: [Int]
        $videoTime: Int
        $resolution: Int
        $page: Int!
        $materialRatio: [String]
        $isStrict: Boolean
        $appCashWay: [AppCashWay]
        $labelGenre: [Int]
        $novalLabel: [Int]
        $resourceElement: [Int]
        $order: DomesticLeafletListSort!
        $isAllDate: Int
        $materialTag: [Int]
    ) {
        domesticLeafletList (
            id: $id
            videoShotId: $videoShotId
            appBrand: $appBrand
            brand: $brand
            dev: $dev
            shop: $shop
            product: $product
            landingPage: $landingPage
            campaignId: $campaignId
            campaignType: $campaignType
            appCampaignId: $appCampaignId
            appCampaignType: $appCampaignType
            keyword: $keyword
            accurateSearch: $accurateSearch
            outerPurpose: $outerPurpose
            industry: $industry
            gameStyle: $gameStyle
            channel: $channel
            media: $media
            startDate: $startDate
            endDate: $endDate
            isNew: $isNew
            city: $city
            platform: $platform
            format: $format
            mtype: $mtype
            videoTime: $videoTime
            resolution: $resolution
            page: $page
            materialRatio: $materialRatio
            isStrict: $isStrict
            appCashWay: $appCashWay
            labelGenre: $labelGenre
            novalLabel: $novalLabel
            resourceElement: $resourceElement
            order: $order
            isAllDate: $isAllDate
            materialTag: $materialTag
        ) {
            data {
                leaflet {
                    id
                    creative {
                        type
                        id
                        slogan
                        description
                        poster
                        video {
                            id
                            poster
                            path
                            originalUrl
                            duration
                        }
                    }
                }
                highlight
                contentMatch
            }
        }
    }
    """

    payload = {
        "operationName": "domesticLeafletList",
        "query": query,
        "variables": {
            "isNew": 0,
            "resolution": 0,
            "isExact": False,
            "order": "impression_desc",
            "startDate": start_date,
            "endDate": end_date,
            "page": 1,
            "brandType": 401,
            "isStrict": True,
            "appBrand": "Q4tst59gXZJKmkpU1KB8mw=="
        }
    }

    print(f"🚀 正在通过 API 请求 ({start_date} ~ {end_date}) 广告数据...")
    response = requests.post(url, headers=headers, json=payload)
    
    try:
        json_data = response.json()
    except:
        print("[!] 接口返回非 JSON 数据！")
        return

    if 'errors' in json_data:
        print(f"[!] 接口报错：{json_data['errors']}")
        return

    try:
        items = json_data['data']['domesticLeafletList']['data']
        print(f"✅ 获取到 {len(items)} 条数据，准备下载视频...")
    except:
        print("[!] 解析数据结构失败！")
        return

    base_path = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    out_dir = os.path.join(base_path, "public", "videos")
    data_dir = os.path.join(base_path, "src", "data")
    os.makedirs(out_dir, exist_ok=True)
    os.makedirs(data_dir, exist_ok=True)

    extracted_data = []
    mock_categories = ["游戏", "电商", "生活服务", "金融", "教育", "工具"]
    mock_tags = ["实拍演示", "动画", "口播", "剧情", "测评", "促销", "明星代言", "第一人称", "数据对比", "高能混剪"]

    for item in items:
        leaflet = item.get("leaflet")
        if not leaflet: continue
        creative = leaflet.get("creative") or {}
        video = creative.get("video")
        if not video: continue
        
        video_url = video.get("originalUrl")
        video_id = video.get("id") or leaflet.get("id")
        title = creative.get("slogan") or creative.get("description") or "无标题广告"
        impressions = f"{random.randint(10, 500)}K"
        
        filename = download_video(title, video_url, video_id, out_dir)
        if filename:
            extracted_data.append({
                "id": str(video_id),
                "title": title[:60] + "..." if len(title) > 60 else title,
                "impressions": impressions,
                "videoName": filename,
                "date": end_date,
                "category": random.choice(mock_categories),
                "tags": random.sample(mock_tags, random.randint(2, 4))
            })

    data_file = os.path.join(data_dir, "ads.json")
    with open(data_file, "w", encoding="utf-8") as f:
        json.dump(extracted_data, f, ensure_ascii=False, indent=2)
    print(f"\\n🎉 采集完毕！共 {len(extracted_data)} 条数据，已保存至 {data_file}")

    premium_html = os.path.join(base_path, "premium-dashboard.html")
    if os.path.exists(premium_html):
        try:
            with open(premium_html, "r", encoding="utf-8") as f:
                content = f.read()
            start_marker = "// Embedded data to avoid CORS issues on file:// protocol"
            end_marker = "const adGrid = document.getElementById('adGrid');"
            new_data_str = json.dumps(extracted_data, ensure_ascii=False, indent=2)
            import re
            pattern = re.escape(start_marker) + r".*?" + re.escape(end_marker)
            new_block = f"{start_marker}\\n        const adsData = {new_data_str};\\n        "
            updated_content = re.sub(pattern, new_block + end_marker, content, flags=re.DOTALL)
            with open(premium_html, "w", encoding="utf-8") as f:
                f.write(updated_content)
            print(f"✨ 已同步更新零依赖看板: {premium_html}")
        except Exception as e:
            print(f"[!] 同步 HTML 看板失败: {e}")

if __name__ == "__main__":
    fetch_ads()
