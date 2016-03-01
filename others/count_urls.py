# -*- coding: utf-8 -*-
import requests
import os
import json
import re
import argparse
import codecs
import sys
import time
from datetime import date, timedelta
from bs4 import BeautifulSoup

def get_date(name):
    m = re.search("^(.+?)\-\d+$",name)
    if m is not None:
        return m.group(1)
    else:
        print "error file/dir name %s" %name
        sys.exit(-1)



def parse_html(html_file):
    all_urls = {}
    content = ""
    with open(html_file) as f:
        content = f.read()
    soup = BeautifulSoup(content,'lxml')
    # links = soup.find(id="ires").ol.find_all("h3",class_='r')
 
    # for l in links:
    #     url = l.a['href']
    #     m = re.search('http[^\&]+',url)
    #     if m is not None:
    #         all_urls.append(m.group(0))
    #         print "append",m.group(0)
    #     else:
    #         print "wrong url"
    #         print url
    #         continue
    results = soup.find(id="ires").ol.find_all(class_=re.compile("(_HId)|(_sQb)"))
    for result in results:
        url = result['href']
        m = re.search('http[^\&]+',url)
        if m is not None:
            all_urls[m.group(0)] = 0
            #print "append",m.group(0)
        else:
            print "wrong url"
            print url
            continue


    return all_urls



def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('source_dir')
    parser.add_argument('date')
    args = parser.parse_args()
    
    # find the days that the urls are crawled, and remove the last date
    # since I want to re-crawl it just to be safe. 

    all_files = os.walk(args.source_dir).next()[2]
    all_files.sort()
    urls = {}
    for a_file in all_files:
        date = get_date(a_file)
        if date ==  args.date:
            print "process %s" %a_file
            urls.update(parse_html(os.path.join(args.source_dir, a_file)) )
            print "now there are %d urls" %len(urls)
            
    print "there are %d" %len(urls) 




if __name__ == "__main__":
    main()