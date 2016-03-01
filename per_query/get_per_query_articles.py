"""
crawl all news articles for every query
"""
import argparse
import os,sys
import pprint
from bs4 import BeautifulSoup
import re
from crawl_html import crawl_html
import codecs

def read_record(record_file):
    records = {}
    if os.path.exists(record_file):
        with open(record_file) as f:
            for line in f:
                records[line.rstrip()] = 0

    return records


def get_dirs(source_dir):
    """
    get all directories and files in them
    directory paths are keys, and the list of
    documents in them are values
    """
    all_dirs = {}
    it = os.walk(source_dir)
    it.next()
    dirs = list(it)
    for d in dirs:
        if len(d[1])==0:
            all_dirs[d[0]] = d[2] 
    return all_dirs


def check_valid(html_file):
    with open(html_file) as f:
        soup = BeautifulSoup(f,'lxml')
    x = soup.find(class_="mnr-c")
    if x is not None:
        m = x.text.find("did not match any news results")
        if m ==-1:
            print "-"*20
            print "Document %s has the class, but the text is different" %html_file
            print x.text
            print "-"*20
            return False
        else:
            return False
    else:
        return True

def get_urls_and_ranking(html_file, page_id):
    """
    get the URLs and their Google rankings for a result page
    """
    all_urls = {}
    print "the file is %s" %html_file
    with open(html_file) as f:
        soup = BeautifulSoup(f,'lxml')
    cluster_idx = 0
    for result in soup.find(id="ires").find_all('div', class_='g'):
        cluster_idx += 1
        for ele in result.find_all('a', class_=re.compile("(_HId)")):
            url = ele['href']
            all_urls[url] = str(page_id+cluster_idx)
            print url, str(page_id+cluster_idx)

    return all_urls

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source_dir")
    parser.add_argument("dest_dir")
    parser.add_argument("record")
    args=parser.parse_args()
    args.source_dir = os.path.abspath(args.source_dir)
    args.dest_dir = os.path.abspath(args.dest_dir)
    all_dirs = get_dirs(args.source_dir)
    records = read_record(args.record)
    f_record = open(args.record,"a")
    
    for a_dir in all_dirs:
        # if the directory is already crawled
        #base_dir = os.path.basename(a_dir)
        #if base_dir in records:
        #    continue

        #If there is only one page, check whether it is a valid page
        #If not, there are not reuslts for the query, go to the next
        if len(all_dirs[a_dir])==1:
            if not check_valid(os.path.join(a_dir,all_dirs[a_dir][0]) ):
                continue

        relative_dir = os.path.relpath(a_dir,args.source_dir)
        output_dir = os.path.join(args.dest_dir,relative_dir)
        if not os.path.exists(output_dir):
            os.makedirs(output_dir)
        error_file = os.path.join(output_dir,"error")
        map_file = os.path.join(output_dir,"map")
        for page_id in all_dirs[a_dir]:
            file_path = os.path.join(a_dir,page_id)
            if file_path in records:
                continue
            urls = get_urls_and_ranking(file_path,int(page_id) ) 
            f_map = open(map_file,"a")
            for url in urls:   
                news_article=crawl_html(url,error_file)
                if news_article is not None:
                    print "got %s" %url
                    name = os.path.join(output_dir,urls[url]+".html")
                    with codecs.open(name,"w",encoding='utf-8') as f:
                        f.write(news_article)
                    f_map.write( "%s %s\n" %(urls[url],url) )
            f_map.close()
            records[file_path] = 0
            f_record.write("%s\n" %file_path)
            #print "output dir is %s" %output_dir

        # put already crawled dir names(disaster instance name) in the record file
        #and records dictionary 
        


    f_record.close()

    #pp=pprint.PrettyPrinter(indent=4)
    #pp.pprint(all_dirs)
    


if __name__=="__main__":
    main()