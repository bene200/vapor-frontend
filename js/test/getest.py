from Bio import Entrez

Entrez.email = "berau90@web.de"
search_handle = Entrez.esearch(db="nucest",term="Dioscorea alata", usehistory="y", retmax="10")
search_results = Entrez.read(search_handle)
search_handle.close()

gi_list = search_results["IdList"]

webenv = search_results["WebEnv"]
query_key = search_results["QueryKey"]
count = int(search_results["Count"])

batch_size = 10
out_handle = open("discorea_alata_est.fasta", "w")
for start in range(0,count,batch_size):
    end = min(count, start+batch_size)
    print("Going to download record %i to %i" % (start+1, end))
    fetch_handle = Entrez.efetch(db="nucest", rettype="fasta", retmode="text",
                                 retstart=start, retmax=batch_size,
                                 webenv=webenv, query_key=query_key)
    data = fetch_handle.read()
    fetch_handle.close()
    out_handle.write(data)
out_handle.close()

