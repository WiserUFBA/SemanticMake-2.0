package com.eudes.semanticApi.api;

import org.apache.jena.query.DatasetAccessor;
import org.apache.jena.query.DatasetAccessorFactory;

import java.util.ArrayList;
import java.util.List;

/**
 * Created by Eudes on 13/11/2017.
 */
public class ShowGraph {

    public static void main(String args[]) {

        List<Pair> pairs = new ArrayList<>();
        pairs.add(new Pair("name",      "qwerqwerqwer", false,     ""));
        pairs.add(new Pair("site",      "http://site.com",            true,      "FN"));
        pairs.add(new Pair("knows",     "http://eudesdionatas.com",   true,      ""));
        pairs.add(new Pair("FN",        "",                           true,      ""));
        pairs.add(new Pair("FamilyName","Souza",                      false,     "FN"));
        pairs.add(new Pair("GivenName", "Eudes",                      false,     "FN"));
        pairs.add(new Pair("age",       "32",                         false,      ""));
        pairs.add(new Pair("genre",     "Male",                       false,      ""));
        List<Pair> pairs2 = new ArrayList<>();
        pairs2.add(new Pair("teste3",     "asdfasdf",                       false,      ""));
        pairs2.add(new Pair("teste4",     "zxcvzxcv",                       false,      ""));
        List<Vocabulary> vocabularies = new ArrayList<>();
        vocabularies.add(new Vocabulary("http://xmlns.com/foaf/0.1/", "foaf", pairs2));
        vocabularies.add(new Vocabulary("http://www.w3.org/2001/vcard-rdf/3.0#", "vcard",pairs));
        ResourceApi resourceApi = new ResourceApi("http://pessoa2.com/", "pes3", "pessoa3", vocabularies);

        MakeModelController mmc = new MakeModelController();
        String graphURI = "/workspace";
        DatasetAccessor datasetAccessor = DatasetAccessorFactory.createHTTP("http://localhost:3030/SemanticContent");
//        Model model = datasetAccessor.getModel(graphURI);
//        if (model.getGraph().size() > 0 ) {
//            System.out.println("grafo já existe e tem tamanho: " + model.getGraph().size());
//
//        }


//        mmc.deleteGraph("workspace");
//        mmc.deleteGraph("workspace-2e621f01");
//        mmc.deleteGraph("workspace-236d0f1f");
//        mmc.deleteGraph("workspace-04721645");
//        mmc.deleteGraph("workspace-7a2b8a7b");
//        mmc.deleteGraph("workspace-8b699bd5");
//        mmc.deleteGraph("workspace-4c44ae08");
//        mmc.deleteGraph("wworkspace-0c02f8ea");


//        Model model = mmc.createModel(resourceApi);
//        mmc.addAsResource(model, resourceApi);
//        datasetAccessor.add(graphURI, model);
//        model.write(System.out);


//        mmc.getResource("workspace", "http://pessoa2.com/a376ad10-fae7-4094-a56c-985d5df1c9bb");
        mmc.deleteResource("workspace", "http://pessoa2.com/183c395b-f0d7-472e-9fd0-91c628877caf");
//        mmc.updateResouce("workspace", "http://pessoa2.com/183c395b-f0d7-472e-9fd0-91c628877caf", "http://www.w3.org/2001/vcard-rdf/3.0#name", "E D S Souza");
//          mmc.deleteProperty("workspace", "http://pessoa2.com/183c395b-f0d7-472e-9fd0-91c628877caf", "http://www.w3.org/2001/vcard-rdf/3.0#FamilyName");
    }

}
