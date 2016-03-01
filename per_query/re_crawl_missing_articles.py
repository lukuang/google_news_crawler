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




def get_dirs(source_dir):
    """
    get all directories and files in them
    directory paths are keys, and the list of
    documents in them are values
    """
    all_dirs = set()
    it = os.walk(source_dir)
    it.next()
    dirs = list(it)
    for d in dirs:
        if len(d[1])==0:
            all_dirs.add(d[0])
    return all_dirs






def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("dest_dir")
    #parser.add_argument("record")
    args=parser.parse_args()
    args.dest_dir = os.path.abspath(args.dest_dir)
    all_dirs = get_dirs(args.dest_dir)
    #records = read_record(args.record)
    #f_record = open(args.record,"a")
    re_crawl_count = 0
    error_count = 0
    success_count = 0
    for a_dir in all_dirs:

        #print "process %s" %a_dir

        map_file = os.path.join(a_dir,"map")
        error_file = os.path.join(a_dir,"error")
        with open(map_file) as f:
            for line in f:
                line = line.rstrip()
                m = re.search("^(\d+?)\s(.+?)$",line)
                if m is not None:
                    d_name = "%s.html" %(m.group(1))
                    url = m.group(2)
                    if not os.path.exists( os.path.join(a_dir,d_name) ):
                        re_crawl_count += 1
                        news_article=crawl_html(url,error_file)
                        if news_article is not None:
                            #print "got %s" %url
                            name = os.path.join(a_dir,d_name)
                            with codecs.open(name,"w",encoding='utf-8') as f:
                                f.write(news_article)
                        else:
                            error_count += 1
                    else:
                        success_count += 1
                else:
                    print "map file %s has error" %(map_file)
                    print "error line:"
                    print line
                    sys.exit(-1)
    print "re_crawl_count: %d, error_count: %d, success_count: %d" %(re_crawl_count, error_count, success_count)

            #f_record.write("%s\n" %file_path)
            #print "output dir is %s" %output_dir

        # put already crawled dir names(disaster instance name) in the record file
        #and records dictionary 
        


    #f_record.close()

    #pp=pprint.PrettyPrinter(indent=4)
    #pp.pprint(all_dirs)
    


if __name__=="__main__":
    main()