#!/sw/bin/ruby
require 'bio'


ncbi        = Bio::NCBI::REST.new
Bio::NCBI.default_email = "berau90@web.de"
sequenceIDs = ncbi.esearch("Hymenoptera[organism]",
                           { "db"=>"protein", "rettype"=>"gb", "retmax"=> 10000000})    
puts sequenceIDs
#sequences   = ncbi.efetch(ids = sequenceIDs,
#                          {"db"=>"protein", "rettype"=>"fasta", "retmax"=> 10000000})
