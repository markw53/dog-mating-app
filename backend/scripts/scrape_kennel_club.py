# scripts/scrape_kennel_club.py
import requests
from bs4 import BeautifulSoup
import pandas as pd
import time
import json
import re

def get_high_res_url(url, width=600, height=600):
    """
    Takes a KC image URL and returns a higher resolution version.
    Replaces width/height params or adds them.
    """
    if not url:
        return ''
    
    # Split URL at query string
    if '?' in url:
        base = url.split('?')[0]
        params = url.split('?')[1]
        
        # Replace width parameter
        params = re.sub(r'width=\d+', f'width={width}', params)
        # Replace height parameter  
        params = re.sub(r'height=\d+', f'height={height}', params)
        
        # If no width/height existed, use pad mode at 600
        if 'width' not in params:
            params += f'&width={width}'
        if 'height' not in params:
            params += f'&height={height}'
            
        return f"{base}?{params}"
    
    return url


def scrape_kennel_club_breeds():
    """
    Scrapes breed data from The Royal Kennel Club website
    """
    url = "https://www.royalkennelclub.com/search/breeds-a-to-z/"
    
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
    }
    
    print("🔍 Fetching breed data from The Kennel Club...")
    time.sleep(1)
    
    try:
        response = requests.get(url, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        breed_cards = soup.find_all("a", {"class": "m-breed-card__link"})
        
        print(f"✅ Found {len(breed_cards)} breed cards")
        
        breeds_data = []
        
        for i, card in enumerate(breed_cards):
            try:
                title_elem = card.find("strong", {"class": "m-breed-card__title"})
                category_elem = card.find("div", {"class": "m-breed-card__category"})
                image_elem = card.find("img", {"class": "a-media__image"})
                
                breed_name = title_elem.getText().strip() if title_elem else ""
                category = category_elem.getText().strip() if category_elem else ""
                breed_link = card.get('href', '')
                
                # Get the thumbnail URL (we'll upgrade it from the detail page)
                thumbnail_url = image_elem.get('src', '') if image_elem else ''
                
                if not breed_name:
                    continue
                
                print(f"  📖 [{i+1}/{len(breed_cards)}] Scraping {breed_name}...")
                time.sleep(0.5)
                
                # Scrape the detail page - this gets high-res images + breed info
                breed_details = scrape_breed_details(breed_link, headers)
                
                # Use the best available image:
                # 1. Gallery photo (real dog photo, 400x300)
                # 2. Hero image (illustration, 1000px wide) 
                # 3. Upscaled thumbnail (fallback)
                image_url = ''
                if breed_details.get('gallery_image'):
                    image_url = get_high_res_url(breed_details['gallery_image'], 600, 600)
                elif breed_details.get('hero_image'):
                    image_url = breed_details['hero_image']
                elif thumbnail_url:
                    image_url = get_high_res_url(thumbnail_url, 600, 600)
                
                # Extract group from URL
                kennel_club_group = breed_details.get('kennel_club_group', '')
                if not kennel_club_group and breed_link:
                    match = re.search(r'/breeds/([^/]+)/', breed_link)
                    if match:
                        kennel_club_group = match.group(1).title()
                
                # Build the full official link
                official_link = ''
                if breed_link:
                    if breed_link.startswith('http'):
                        official_link = breed_link
                    else:
                        official_link = f"https://www.royalkennelclub.com{breed_link}"
                
                breed_data = {
                    'name': breed_name,
                    'category': category,
                    'imageUrl': image_url,
                    'officialLink': official_link,
                    'kennelClubGroup': kennel_club_group,
                    'size': breed_details.get('size', ''),
                    'lifespan': breed_details.get('lifespan', ''),
                    'exercise_needs': breed_details.get('exercise_needs', ''),
                    'grooming': breed_details.get('grooming', ''),
                    'temperament': breed_details.get('temperament', ''),
                    'good_with_children': breed_details.get('good_with_children', ''),
                    'height': breed_details.get('height', ''),
                    'weight': breed_details.get('weight', ''),
                }
                
                breeds_data.append(breed_data)
                img_status = '🖼️' if image_url else '❌'
                print(f"    ✅ {breed_name} complete (Group: {kennel_club_group}) {img_status}")
                
            except Exception as e:
                print(f"    ❌ Error processing {breed_name}: {e}")
                continue
        
        return breeds_data
        
    except Exception as e:
        print(f"❌ Error fetching data: {e}")
        return []


def scrape_breed_details(breed_path, headers):
    """
    Scrapes detailed information from a breed's detail page
    """
    details = {
        'size': '',
        'lifespan': '',
        'exercise_needs': '',
        'grooming': '',
        'temperament': '',
        'good_with_children': '',
        'kennel_club_group': '',
        'height': '',
        'weight': '',
        'hero_image': '',
        'gallery_image': '',
    }
    
    if not breed_path:
        return details
    
    try:
        # Build full URL
        if breed_path.startswith('http'):
            full_url = breed_path
        else:
            full_url = f"https://www.royalkennelclub.com{breed_path}"
        
        response = requests.get(full_url, headers=headers)
        response.raise_for_status()
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # ============================================
        # GET HIGH-RES IMAGES
        # ============================================
        
        # 1. Get hero/main illustration image (first a-media__image with breed-specific URL)
        all_main_images = soup.find_all("img", {"class": "a-media__image"})
        for img in all_main_images:
            src = img.get('src', '')
            # Skip generic site images (find-a-club, find-a-puppy, kcpi)
            if src and 'media/' in src and not any(skip in src for skip in ['find-a-club', 'find-a-puppy', 'kcpi', 'navigation', 'thumbnail', 'memberships']):
                details['hero_image'] = src
                break
        
        # 2. Get gallery thumbnail (real photo of the dog)
        gallery_images = soup.find_all("img", {"class": "m-gallery__thumbnail"})
        if gallery_images:
            # Prefer "standing" photo, then first available
            for img in gallery_images:
                src = img.get('src', '')
                if 'standing' in src.lower():
                    details['gallery_image'] = src
                    break
            
            # If no "standing" photo found, use the first gallery image
            if not details['gallery_image'] and gallery_images[0].get('src'):
                details['gallery_image'] = gallery_images[0].get('src', '')
        
        # ============================================
        # GET BREED SUMMARY DATA
        # ============================================
        
        summary_items = soup.find_all("dd", {"class": "m-breed-summary__value"})
        summary_labels = soup.find_all("span", {"class": "m-breed-summary__key-label"})
        
        for label, value in zip(summary_labels, summary_items):
            label_text = label.getText().strip().lower()
            value_text = value.getText().strip()
            
            if 'size' in label_text:
                details['size'] = value_text
            elif 'height' in label_text:
                details['height'] = value_text
            elif 'weight' in label_text:
                details['weight'] = value_text
            elif 'lifespan' in label_text or 'life' in label_text:
                details['lifespan'] = value_text
            elif 'exercise' in label_text:
                details['exercise_needs'] = value_text
            elif 'grooming' in label_text:
                details['grooming'] = value_text
            elif 'temperament' in label_text:
                details['temperament'] = value_text
            elif 'children' in label_text:
                details['good_with_children'] = value_text
        
        # ============================================
        # GET KENNEL CLUB GROUP
        # ============================================
        
        group_elem = soup.find("div", {"class": "m-breed-header__group"})
        if group_elem:
            details['kennel_club_group'] = group_elem.getText().strip()
        else:
            # Try breadcrumb
            breadcrumb = soup.find("nav", {"class": "m-breadcrumb"})
            if breadcrumb:
                links = breadcrumb.find_all("a")
                for link in links:
                    text = link.getText().strip().lower()
                    if text in ['toy', 'hound', 'gundog', 'terrier', 'utility', 'working', 'pastoral']:
                        details['kennel_club_group'] = link.getText().strip().title()
                        break
            
            # Try extracting from URL
            if not details['kennel_club_group']:
                match = re.search(r'/breeds/([^/]+)/', str(soup))
                if match:
                    group = match.group(1).title()
                    if group.lower() in ['toy', 'hound', 'gundog', 'terrier', 'utility', 'working', 'pastoral']:
                        details['kennel_club_group'] = group
        
    except Exception as e:
        print(f"    ⚠️ Error fetching breed details: {e}")
    
    return details


def map_to_firebase_format(kennel_data):
    """
    Maps Kennel Club data to database format
    """
    
    category_mapping = {
        'Gundog': 'Sporting',
        'Hound': 'Hound',
        'Pastoral': 'Herding',
        'Terrier': 'Terrier',
        'Toy': 'Toy',
        'Utility': 'Non-Sporting',
        'Working': 'Working'
    }
    
    size_mapping = {
        'Small': {'height': '20-35 cm', 'weight': '5-10 kg'},
        'Medium': {'height': '35-50 cm', 'weight': '10-25 kg'},
        'Large': {'height': '50-65 cm', 'weight': '25-40 kg'},
        'Giant': {'height': '65+ cm', 'weight': '40+ kg'}
    }
    
    firebase_data = []
    
    for breed in kennel_data:
        kennel_group = breed.get('kennelClubGroup', '').title()
        breed_type = category_mapping.get(kennel_group, 'Non-Sporting')
        
        size_desc = breed.get('size', '').lower()
        size_category = 'Medium'
        if 'small' in size_desc:
            size_category = 'Small'
        elif 'large' in size_desc or 'giant' in size_desc:
            size_category = 'Large'
        
        height = breed.get('height') or size_mapping[size_category]['height']
        weight = breed.get('weight') or size_mapping[size_category]['weight']
        
        firebase_breed = {
            'name': breed['name'],
            'type': breed_type,
            'height': height,
            'weight': weight,
            'color': 'Various',
            'longevity': breed.get('lifespan', '10-14 years'),
            'healthProblems': 'Varies by breed - consult veterinarian',
            'imageUrl': breed['imageUrl'],
            'officialLink': breed['officialLink'],
            'kennelClubCategory': kennel_group,
            'size': breed.get('size', ''),
            'exerciseNeeds': breed.get('exercise_needs', ''),
            'grooming': breed.get('grooming', ''),
            'temperament': breed.get('temperament', ''),
            'goodWithChildren': breed.get('good_with_children', ''),
        }
        
        firebase_data.append(firebase_breed)
    
    return firebase_data


def main():
    print("🐕 Kennel Club Breed Scraper")
    print("=" * 50)
    
    kennel_data = scrape_kennel_club_breeds()
    
    if not kennel_data:
        print("❌ No data scraped. Exiting.")
        return
    
    print(f"\n✅ Successfully scraped {len(kennel_data)} breeds")
    
    # Count images
    with_images = sum(1 for b in kennel_data if b['imageUrl'])
    print(f"🖼️  Breeds with images: {with_images}/{len(kennel_data)}")
    
    print("\n📝 Mapping to database format...")
    firebase_data = map_to_firebase_format(kennel_data)
    
    # Save to CSV
    df = pd.DataFrame(firebase_data)
    csv_filename = 'kennel_club_breeds.csv'
    df.to_csv(csv_filename, encoding='utf-8-sig', index=False)
    print(f"✅ Saved to {csv_filename}")
    
    # Save to JSON
    json_filename = 'kennel_club_breeds.json'
    with open(json_filename, 'w', encoding='utf-8') as f:
        json.dump(firebase_data, f, indent=2, ensure_ascii=False)
    print(f"✅ Saved to {json_filename}")
    
    # Print summary
    print("\n📊 Summary:")
    print(f"   Total breeds: {len(firebase_data)}")
    print(f"   Breeds with images: {sum(1 for b in firebase_data if b['imageUrl'])}")
    
    print("\n📈 Breed Type Distribution:")
    type_counts = {}
    for breed in firebase_data:
        breed_type = breed['type']
        type_counts[breed_type] = type_counts.get(breed_type, 0) + 1
    
    for breed_type, count in sorted(type_counts.items()):
        print(f"   {breed_type}: {count}")
    
    # Show first 3 image URLs as verification
    print("\n🖼️  Sample image URLs:")
    for breed in firebase_data[:3]:
        print(f"   {breed['name']}: {breed['imageUrl'][:100]}...")
    
    print("\n🎉 Done! Run: npm run import-breeds")


if __name__ == "__main__":
    main()