"""
crawl all news articles for every query
"""
import argparse
import os,sys
import re
import codecs
import json
from myStemmer import pstem as stem 
from goose import Goose


def normalize_model(a_model,number_of_instances):
    
    occurance = sum(a_model.values())
    for w in a_model:
        a_model[w] /= 1.0*number_of_instances*occurance

def update_profile(profile,a_model,number_of_instances):
    normalize_model(a_model,number_of_instances)
    for w in a_model:
        if w not in profile:
            profile[w] = a_model[w]
        else:
            profile[w] += a_model[w]

def read_stopwords(stopword_file):
    stopwords = set()
    with open(stopword_file) as f:
        for line in f:
            m = re.search("(\w+)", line)
            if m is not None:
                stopwords.add(stem(m.group(1).lower())) 
    return stopwords


def update_from_sentence(sentence,model,stopwords):
    words = re.findall("\w+",sentence.lower())
    words = map(stem,words)
    for w in words:
        if not w.isdigit():
            if w not in stopwords:
                if w not in model:
                    model[w] = 0 
                model[w] += 1
    # else:
    #     for w in words:
    #         if w.isdigit():
    #             continue
    #         if w not in model:
    #             model[w] = 0 
    #         model[w] += 1.0/factor 


def get_text(file_name):
    with open(file_name) as f:
        raw_html = f.read()
    config = {
    "enable_image_fetching": False
    }
    g =  Goose(config=config)
    try:
        article = g.extract(raw_html = raw_html)
    except Exception as e:
        print e
        print "skip error file %s" %file_name
        print "-"*20
        return None
    else:
        return article.cleaned_text


def update_model(file_name,a_model,stopwords):
    text = get_text(file_name)
    if text is not None:
        update_from_text(text,a_model,stopwords)


def update_from_text(text,a_model,stopwords):
    for line in text.split("\n"):
        update_from_sentence(line,a_model,stopwords)


def get_dirs(source_dir):
    """
    get all directories for every disaster
    """
    all_dirs = {}
    for disaster in os.walk(source_dir).next()[1]:
        disaster_dir = os.path.join(source_dir,disaster)
        all_dirs[disaster] = [os.path.join(disaster_dir,d ) for d in os.walk(disaster_dir).next()[1] ]

    return all_dirs


def get_single_profile(sub_dirs,doc_num,stopwords):
    profile = {}
    number_of_instances = len(sub_dirs)
    for a_dir in sub_dirs:
        print "\tget profile for %s" %(os.path.basename(a_dir) )
        for i in xrange(1,doc_num+1):
            a_model = {}
            file_name = os.path.join(a_dir,str(i)+".html")
            if os.path.exists(file_name):
                update_model(file_name,a_model,stopwords)
            update_profile(profile,a_model,number_of_instances)
    return profile




def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("source_dir")
    parser.add_argument("--stopword_file","-s",default = "/home/1546/data/new_stopwords")
    parser.add_argument("dest_dir")
    parser.add_argument("--doc_num",'-n',type=int, default=10)
    #parser.add_argument("record")
    args=parser.parse_args()
    args.source_dir = os.path.abspath(args.source_dir)
    all_dirs = get_dirs(args.source_dir)
    #records = read_record(args.record)
    #f_record = open(args.record,"a")
    stopwords = read_stopwords(args.stopword_file)

    disaster_profile = {}
    for disaster in all_dirs:
        print "for disaster %s:" %(disaster)
        dest_file = os.path.join(args.dest_dir,disaster)
        if not os.path.exists(dest_file):
            disaster_profile[disaster] = get_single_profile(all_dirs[disaster],args.doc_num,stopwords)
            with open(dest_file,"w" ) as f:
                f.write(json.dumps(disaster_profile[disaster]))
        else:
            print "\tprofile already exists and is skipped"
        


if __name__=="__main__":
    main()