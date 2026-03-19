import json
import os
import requests
import time

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
    
    headers = {
        'accept': 'application/json, text/plain, */*',
        'accept-language': 'zh-CN,zh;q=0.9',
        'content-type': 'application/json',
        'cookie': '_ga=GA1.1.23708221.1767929066; _gcl_au=1.1.461179078.1767929072; localeLanguage=zh; MEIQIA_TRACK_ID=380GSNpa5WyKn9lZeNobMYh0JvX; MEIQIA_VISIT_ID=380GSOxek4eYcnjNaBjclMb1glh; _c_WBKFRo=c8DtmUAbFG9UipYDsDrfZ3HKalBZHTaRWxx128gf; videoMuted=true; videoVolume=0; videoplayerDefaultRate=1.5; sessionId=eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NiJ9.eyJqdGkiOiIxNzczODIwODgyNjliYTViZDI2YTY3NSIsImV4cCI6MTc3NDQyNTY4Miwic3ViIjoiMTQwODQwMSIsInRlYW1faWQiOiIiLCJhdXRoX3R5cGUiOjF9.yKYPT1lDvSTp5rgzdOVnOGse24w--z2ojxJAPjY5WRaA_HX2dLPyQtrYPeMIqtzjmh6DBd1YKx98Kk8BjJk-qw; _ga_QNB91PL4C6=GS2.1.s1773820813$o7$g1$t1773820883$j60$l0$h0; _ga_FVS095626N=GS2.1.s1773896284$o46$g1$t1773896812$j55$l0$h0; ph_oEY7uwNI-BrLK7aN1Al8D1-abXKFEeENlm9zn5gOvzM_posthog=%7B%22distinct_id%22%3A%221408401%22%2C%22%24sesid%22%3A%5B1773896816432%2C%22019d0475-380b-7e21-a846-c7cfb408a43a%22%2C1773896284171%5D%7D',
        'origin': 'https://appgrowing-cn.youcloud.com',
        'referer': 'https://appgrowing-cn.youcloud.com/brand/Q4tst59gXZJKmkpU1KB8mw==/leaflet/list?viewType=leaflet&isNew=0&resolution=0&isExact=false&order=impression_desc&startDate=2026-03-13&endDate=2026-03-19&page=1&brandType=401&genre=1&isStrict=true&isSearchAiScene=0',
        'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/146.0.0.0 Safari/537.36',
        'x-operation-name': 'domesticLeafletList'
    }

    # The exact GraphQL Query string
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
            page
            total
            limit
            data {
                leaflet {
                    id
                    startDate
                    endDate
                    duration
                    heat
                    originImpression
                    impression
                    creative {
                        id
                        type
                        slogan
                        description
                        resource {
                            id
                            width
                            height
                            size
                            format
                            poster
                            path
                            originalUrl
                            duration
                            beg_ts
                            end_ts
                        }
                        shareUrl
                    }
                    media {
                        id
                        name
                        icon
                    }
                    format {
                        id
                        name
                    }
                    platform {
                        id
                        name
                    }
                    area {
                        id
                        name
                        type
                    }
                    socialInfo {
                        view_count
                        like_count
                        comment_count
                        share_count
                        repost_count
                        save_count
                    }
                    outerPurpose
                    finalLink
                    materialTags
                    campaign {
                        ... on WechatAccount { type id name icon }
                        ... on Shop { type id name icon }
                        ... on AppBrand { type id name icon industry { id } }
                        ... on Brand { type id name icon }
                        ... on Noval { type id name icon }
                        ... on Applet { type id name icon qrCode industry { id } }
                        ... on Kuaishou { type id name icon }
                        ... on Douyin { type id name icon }
                        ... on Developer { type id name icon }
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
            "startDate": "2026-03-12",
            "endDate": "2026-03-18",
            "page": 1,
            "brandType": 401,
            "isStrict": True,
            "appBrand": "Q4tst59gXZJKmkpU1KB8mw=="
        }
    }

    print("🚀 正在通过直接 API 接口请求广告视频列表数据...")
    response = requests.post(url, headers=headers, json=payload)
    
    try:
        json_data = response.json()
    except json.JSONDecodeError:
        print("[!] 无法解析响应为 JSON。")
        return

    if 'errors' in json_data:
        print(f"[!] 接口报错：{json_data['errors']}")
        return

    try:
        items = json_data['data']['domesticLeafletList']['data']
        print(f"✅ 成功获取到 {len(items)} 条广告数据，开始下载视频...")
    except KeyError:
        print("[!] 解析结构失败，无 'data' 字段或 'domesticLeafletList'！")
        return
    except TypeError:
        # Sometimes data is null
        print("[!] 获取数据为空 (可能没有满足筛选条件的广告)！")
        return
        
    out_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "web-app", "public", "videos"))
    os.makedirs(out_dir, exist_ok=True)
    data_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "web-app", "src", "data"))
    os.makedirs(data_dir, exist_ok=True)

    extracted_data = []

    for item in items:
        leaflet = item.get("leaflet")
        if not leaflet:
            continue
            
        creative = leaflet.get("creative", {}) or {}
        
        # 兼容 slogan 或是 description
        title = creative.get("slogan") or creative.get("description")
        
        if not title:
            # 尝试从外部字段提取高光或匹配文案
            content_match = item.get("contentMatch")
            highlight = item.get("highlight")
            
            # 优先使用 contentMatch 如果它是字符串
            if isinstance(content_match, str) and content_match.strip():
                title = content_match
            elif isinstance(highlight, str) and highlight.strip():
                title = highlight
            else:
                title = "未知文案"
                
        # 去除 HTML 标签 (如果有的话)
        import re
        title = re.sub(r'<[^>]+>', '', title)
        title = title.replace('\\n', ' ').strip()
        
        video_id = leaflet.get("id") or str(int(time.time() * 1000))
        impressions = leaflet.get("impression", 0)
        date = leaflet.get("startDate", "Unknown")
        
        # 提取视频链接
        resources = creative.get("resource", []) or []
        video_url = None
        for res in resources:
            if res.get("originalUrl"):
                video_url = res.get("originalUrl")
                break
        
        if not video_url:
            continue

        filename = download_video(title, video_url, video_id, out_dir)
        if filename:
            # 加入 Dashboard 的结构中
            extracted_data.append({
                "id": str(video_id),
                "title": title[:60] + "..." if len(title) > 60 else title,
                "impressions": impressions,
                "videoName": filename,
                "date": date,
            })
            
    print(f"\\n🎉 采集完毕，共成功下载并处理 {len(extracted_data)} 个视频！")
    
    data_file = os.path.join(data_dir, "ads.json")
    with open(data_file, "w", encoding="utf-8") as f:
        json.dump(extracted_data, f, ensure_ascii=False, indent=2)
    print(f"📦 数据已映射至在线 Web App => {data_file}")
    
    # Sync to premium-dashboard.html for zero-dependency preview
    premium_html = os.path.join(base_dir, "premium-dashboard.html")
    if os.path.exists(premium_html):
        try:
            with open(premium_html, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Find the adsData block and replace it
            start_marker = "// Embedded data to avoid CORS issues on file:// protocol"
            end_marker = "const adGrid = document.getElementById('adGrid');"
            
            new_data_str = json.dumps(extracted_data, ensure_ascii=False, indent=2)
            new_block = f"{start_marker}\\n        const adsData = {new_data_str};\\n        "
            
            import re
            pattern = re.escape(start_marker) + r".*?" + re.escape(end_marker)
            updated_content = re.sub(pattern, new_block + end_marker, content, flags=re.DOTALL)
            
            with open(premium_html, "w", encoding="utf-8") as f:
                f.write(updated_content)
            print(f"✨ 已同步更新零依赖看板 => {premium_html}")
        except Exception as e:
            print(f"[!] 同步 HTML 看板失败: {e}")

if __name__ == "__main__":
    fetch_ads()
