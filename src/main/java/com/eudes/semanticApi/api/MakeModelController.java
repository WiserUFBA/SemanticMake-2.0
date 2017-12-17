package com.eudes.semanticApi.api;

import com.eudes.semanticApi.util.KnownVocabs;
import com.eudes.semanticApi.util.OptGroupBuilder;
import com.eudes.semanticApi.util.Verified;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
import org.apache.jena.query.DatasetAccessor;
import org.apache.jena.query.DatasetAccessorFactory;
import org.apache.jena.rdf.model.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

import static org.springframework.util.StringUtils.hasText;

/**
 * REST controller responsible for handling requests and responses to the client
 * @author Eudes Souza
 * @since 10/2017
 */
@RestController
@RequestMapping(value = "/resources")
@Api(value="onlinestore", description="REST controller responsible for handling requests and responses to the client")
public class MakeModelController {

    /**
     * String that stores the URL of the Fuseki/DatasetName server to store the ontologies
     */
    private String fusekiURI = "http://localhost:3030/SemanticContent";

    /**
     *String that hold the name to the graph of Dataset
     */
    private String graphURI;

    /**
     * DatasetAccessor that hold the URI of the server and the graph name that will store the resources
     */
    private DatasetAccessor datasetAccessor = null;

    /**
     * Start MakeModelController with the URL of the Fuseki server where the ontologies will be stored
     */
    MakeModelController() {
        datasetAccessor = DatasetAccessorFactory.createHTTP(fusekiURI);
    }

    /**
     * Method responsible for receiving and saving the resource passed in the client defined ontology
     * <br> The resource is passed in JSON format
     * @param resource Resource passed by client
     * @return Returns an HTTP code code with the status of the operation
     */
    @PostMapping("/saveResource/{workspace}")
    @ApiOperation(value = "REST controller responsible for handling requests and responses to the client", response = ResponseEntity.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Saves the resource successfully"),
            @ApiResponse(code = 401, message = "You are not authorized to view the resource"),
            @ApiResponse(code = 403, message = "Accessing the resource you were trying to reach is forbidden"),
            @ApiResponse(code = 404, message = "The resource you were trying to reach is not found")})
    public ResponseEntity saveResource(@RequestBody ResourceApi resource, @PathVariable String workspace) {
        resource.setAbout(normalizeURI(resource.getAbout()));
        Model model = createModel(resource);
        addAsResource(model, resource);
        model.write(System.out);
        String resourceId  = "";

        StmtIterator iter = model.listStatements();
        while(iter.hasNext() && !resourceId.contains("http://")){
            resourceId  = iter.nextStatement().getSubject().toString();
        }

        graphURI = (workspace.charAt(0) == '/')? workspace : "/" + workspace;
        try{
            if(datasetAccessor.getModel(graphURI) == null)
                graphURI = "/workspace-" + UUID.randomUUID().toString().substring(0,8);
        }catch (Exception e){

        }

        datasetAccessor.add(graphURI, model);
        return ResponseEntity.ok(new APIResponse(graphURI, resourceId, null));
    }

    /**
     * Method responisble for delete one especified resouce
     * @param workspace String that contains the name of the workspace where the resource is
     * @param resourceId String that contains the ID of the resource to be deleted
     * @return Returns an HTTP code code with the status of the operation
     */
    @DeleteMapping("/deleteResource/{workspace}")
    public ResponseEntity deleteResource(@PathVariable String workspace, @RequestParam String resourceId) {

        graphURI = (workspace.charAt(0) == '/')? workspace : "/" + workspace;
        Model model = datasetAccessor.getModel(graphURI);
        Resource r = model.getResource(resourceId);
        StmtIterator iter = r.listProperties();
        while (iter.hasNext()) {
            Statement stmt      = iter.nextStatement();
            RDFNode object      = stmt.getObject();
            if (object instanceof Resource && !object.toString().contains("http://")) {
                ((Resource) object).removeProperties();
            }
        }
        r.removeProperties();
        datasetAccessor.putModel(graphURI, model);
        return ResponseEntity.ok(new APIResponse(graphURI, resourceId, null));
    }

    /**
     *
     * @param workspace String that contains the name of the workspace to be deleted
     * @return Returns an HTTP code code with the status of the operation
     */
    @DeleteMapping("/deleteGraph/{workspace}")
    public ResponseEntity deleteGraph (@PathVariable String workspace){

        graphURI = (workspace.charAt(0) == '/')? workspace : "/" + workspace;
//        Model model = datasetAccessor.getModel(graphURI);
//        model.getGraph().clear();
        datasetAccessor.deleteModel(graphURI);
        return ResponseEntity.ok(new APIResponse(graphURI, null, null));
    }

    @DeleteMapping("/deleteProperty/{workspace}")
    public  ResponseEntity deleteProperty(@PathVariable String workspace, @RequestParam String resourceId, @RequestParam String propertyUri){

        graphURI = (workspace.charAt(0) == '/')? workspace : "/" + workspace;
        Model model = datasetAccessor.getModel(graphURI);
        Resource subject = model.getResource(resourceId);
        String propertyURI = getPropertyNameSpace(propertyUri);
        String propertyName = getPropertyName(propertyUri);
        Property prop = ResourceFactory.createProperty(propertyURI, propertyName);
        Statement stmt = subject.getProperty(prop);

        //If the resource have the property with a masterproperty
        if (stmt != null){
            StmtIterator propIter   = subject.listProperties();
            while(propIter.hasNext()){
                Statement propStmt  = propIter.nextStatement();
                Property masterProp = propStmt.getPredicate();
                if(masterProp.toString().equals(propertyUri)) {
                    prop            = masterProp;
                    RDFNode object  = stmt.getObject();
                    if(object instanceof Resource){
                        ((Resource) object).removeProperties();
                    }
                    break;
                }
            }
        }
        //If the resource don't have the property like a master property but can have with a subproperty
        else {
            StmtIterator propIter = subject.listProperties();
            while(propIter.hasNext()){
                Statement propStmt  = propIter.nextStatement();
                Property property   = propStmt.getPredicate();
                RDFNode object      = null;
                try{
                    object          = propStmt.getObject();
                }catch (Exception e){  }
                if (object != null && object instanceof Resource && property.toString().contains(propertyURI) && !object.toString().contains("http://") ) {
                    StmtIterator subIter    = ((Resource) object).listProperties();
                    subject                 = (Resource) object;
                    while(subIter.hasNext()){
                        Statement subStmt   = subIter.nextStatement();
                        Property subProp    = subStmt.getPredicate();
                        if(subProp.toString().equals(propertyUri)) {
                            prop            = subProp;
                        }
                    }
                }
            }
        }
        subject.removeAll(prop);
        datasetAccessor.putModel(graphURI, model);
        return ResponseEntity.ok( new APIResponse(graphURI, resourceId, propertyUri));
    }

    @PutMapping("/updateProperty/{workspace}")
    public ResponseEntity updateProperty(@PathVariable String workspace, @RequestParam String resourceId, @RequestParam String propertyUri, @RequestParam String newValue){
        graphURI = (workspace.charAt(0) == '/')? workspace : "/" + workspace;
        Model model = datasetAccessor.getModel(graphURI);
        Resource subject        = model.getResource(resourceId);
        String propertyURI      = getPropertyNameSpace(propertyUri);
        String propertyName     = getPropertyName(propertyUri);
        Property prop           = ResourceFactory.createProperty(propertyURI, propertyName);
        Statement stmt          = subject.getProperty(prop);
        boolean propAsResource  = false;
        boolean propExists      = false;
        //If the resource have the property with a masterproperty
        if (stmt != null){
            propAsResource = stmt.getObject().toString().contains("http://");

            StmtIterator propIter = subject.listProperties();
            while(propIter.hasNext()){
                Statement propStmt = propIter.nextStatement();
                Property masterProp = propStmt.getPredicate();
                if(masterProp.toString().equals(propertyUri)) {
                    prop        = masterProp;
                    propExists  = true;
                    break;
                }
            }
        }
        //If the resource don't have the property like a master property but can have with a subproperty
        else{
            StmtIterator propIter = subject.listProperties();

            while(propIter.hasNext()){
                Statement propStmt  = propIter.nextStatement();
                Property property   = propStmt.getPredicate();
                Resource object     = null;

                try{
                     object         = (Resource) propStmt.getObject();
                }catch (Exception e){  }

                if (object != null && object instanceof Resource && property.toString().contains(propertyURI) && !object.toString().contains("http://") ) {
                    StmtIterator subIter    = ((Resource) object).listProperties();
                    subject                 = (Resource) object;
                    while(subIter.hasNext()){
                        Statement subStmt   = subIter.nextStatement();
                        Property subProp    = subStmt.getPredicate();
                        RDFNode subObject   = subStmt.getObject();
                        if(subProp.toString().equals(propertyUri)) {
                            propAsResource  = subObject.toString().contains("http://");
                            prop            = subProp;
                            propExists      = true;
                        }
                    }
                }
            }
        }

        subject.removeAll(prop);

        if(propExists){
            if(propAsResource){
                Resource propResource = ResourceFactory.createResource(newValue);
                model.add(subject, prop, propResource);
            } else{
                subject.addProperty(prop,newValue);
            }
            datasetAccessor.putModel(graphURI, model);
            return ResponseEntity.ok(   new APIResponse(graphURI, resourceId, propertyURI)   );
        }
        else
            return ResponseEntity.ok(   new APIResponse(graphURI, resourceId, propertyURI)   );
    }

    @GetMapping("/getResources/{workspace}")
    public ResponseEntity<List<ResourceApi>> getResources(@PathVariable String workspace, @RequestParam String propertyUri, @RequestParam String value){
        graphURI = (workspace.charAt(0) == '/')? workspace : "/" + workspace;
        Model model = datasetAccessor.getModel(graphURI);
        String propertyURI = getPropertyNameSpace(propertyUri);
        String propertyName = getPropertyName(propertyUri);
        Property prop = ResourceFactory.createProperty(propertyURI, propertyName);
        ResIterator iter = model.listResourcesWithProperty(prop);
        List<ResourceApi> resources = new ArrayList<>();
        while(iter.hasNext()){
            Resource resource = iter.nextResource();
            StmtIterator stmt = resource.listProperties();
            while(stmt.hasNext()){
                Statement triple = stmt.nextStatement();
                Property predicate = triple.getPredicate();
                RDFNode object = triple.getObject();
                if( object.toString().equals(value) && predicate.equals(prop)){
                    ResourceApi resourceApi = getResourceApi(workspace, resource.getURI());
                    if (resourceApi != null) resources.add(resourceApi);
                } else if (object instanceof Resource && !object.toString().contains("http://")){
                    StmtIterator subIter = ((Resource) object).listProperties();
                    while(subIter.hasNext()){
                        Statement subTriple = subIter.nextStatement();
                        Property subProp = subTriple.getPredicate();
                        RDFNode subObject = subTriple.getObject();
                        if(subObject.toString().equals(value) && subProp.equals(prop)) {
                            ResourceApi resourceApi = getResourceApi(workspace, resource.getURI());
                            if (resourceApi != null) resources.add(resourceApi);
                        }
                    }
                }
            }
        }
        return ResponseEntity.ok(resources);
    }


    /**
     * Method responsible for retrieving predicates of vocabulary of interest according to the given term
     * @param vocabPrefix String with the prefix of the vocabulary in which the searches will be done
     * @param search String with the search term to find properties with similarity to the given term
     * @return Returns an HTTP status 'ok' with an OptGroup list. Each of these contains specific predicates of that group defined in the vocabulary.
     * <br> An example is Schema.org which has Product, Place, Person, Organization, Review, Action ...
     */
    @GetMapping("/getVocabularyData")
    @ApiOperation(value = "Method responsible for retrieving predicates of vocabulary of interest according to the given term", response = OptGroup.class, responseContainer = "Set")
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Returns the predicate list successfully"),
            @ApiResponse(code = 401, message = "You are not authorized to view the resource"),
            @ApiResponse(code = 403, message = "Accessing the resource you were trying to reach is forbidden"),
            @ApiResponse(code = 404, message = "The resource you were trying to reach is not found")})
    public ResponseEntity<Collection<OptGroup>> getVocabularyPredicates(
            @RequestParam(value = "vocabPrefix", required = false) String vocabPrefix,
            @RequestParam(value = "search", required = false) String search){

        List<OptGroup> predicates = new ArrayList<>();
        if (!hasText(vocabPrefix) || !hasText(search))
            return ResponseEntity.ok(predicates);

        KnownVocabs knownVocab = KnownVocabs.valueOf(vocabPrefix.toUpperCase());

        OptGroupBuilder optGroupBuilder = new OptGroupBuilder();
        Map<String, OptGroup> optGroupMap = optGroupBuilder.build(knownVocab.getUri(), knownVocab.getFilePath(), search);

        return ResponseEntity.ok(optGroupMap.values());
    }

    @GetMapping("/getResource/{workspace}")
    public ResponseEntity<ResourceApi> getResource(@PathVariable String workspace, @RequestParam String resourceId) {

        ResourceApi resource = getResourceApi(workspace, resourceId);

        return ResponseEntity.ok(resource);
    }

    private ResourceApi getResourceApi(String workspace, String resourceId) {

        ResourceApi resource = new ResourceApi();

        if(workspace != null && resourceId != null){
            String graphURI = (workspace.charAt(0) == '/') ? workspace : ("/" + workspace);

            resourceId = resourceId.replace("|", "/");
            resourceId = resourceId.replace("_", ".");
            Model model = datasetAccessor.getModel(graphURI);
            if (model == null) return null;
            Resource r = model.getResource(resourceId);
            if (r == null) return null;

            int uriSize             = r.getURI().length();
            int resourceNameSize    = getResourceNameSize(r);
            String resourcePrefix   = r.getURI().substring(0, uriSize - resourceNameSize);
            resource.setPrefix( model.getNsURIPrefix(resourcePrefix) );
            resource.setName(getResourceTypeName(r));
            resource.setAbout(r.getURI());

            List<PrefixedPair> prefixedPairs = getPrefixedPairs(model, r);

            List<Vocabulary> vocabularies = getVocabularies(prefixedPairs);

            resource.setVocabularies(vocabularies);
        }

        return resource;
    }

    private int getResourceNameSize(Resource resource){
        int resourceNameSize = 0;
        String resourceUri = resource.getURI();
        for (int x = resourceUri.length(); resourceUri.charAt(x - 1) != '/'; x--)
            resourceNameSize++;
        return resourceNameSize;
    }

    private void showStatements(StmtIterator iter2) {
        while (iter2.hasNext()){
            Statement stmt      = iter2.nextStatement();  // get next statement
            Resource subject    = stmt.getSubject();     // get the subject
            Property predicate  = stmt.getPredicate();   // get the predicate
            RDFNode object      = stmt.getObject();      // get the object

            System.out.print(subject.toString());
            System.out.print(" " + predicate.toString() + " ");
            if (object instanceof Resource) {
                StmtIterator subiter = ((Resource) object).listProperties();
                while(subiter.hasNext()){
                    Statement subStmt = subiter.nextStatement();
                    Resource subsubject     = subStmt.getSubject();     // get the subject
                    Property subpredicate   = subStmt.getPredicate();   // get the predicate
                    RDFNode subobject       = subStmt.getObject();      // get the object
                    System.out.println(subsubject.toString());
                    System.out.print(" " + subpredicate.toString() + " ");
                    System.out.print(" \"" + subobject.toString() + "\"");
                }
                System.out.print(object.toString());
            } else {
                // object is a literal
                System.out.print(" \"" + object.toString() + "\"");
            }

            System.out.println(" .");
        }
    }

    private String getResourceTypeName(Resource resource) {
        StmtIterator iter = resource.listProperties();
        String resourceTypeName = null;
        while (iter.hasNext()) {
            Statement stmt      = iter.nextStatement();
            RDFNode object      = stmt.getObject();
            if (stmt.getPredicate().getLocalName().equals("type")) {
                String typeUri  = ((Resource) object).getURI();
                resourceTypeName    = getPropertyName(typeUri);
                break;
            }
        }
        return resourceTypeName;
    }

    private String getPropertyName(String propertyUri) {
         int propSize = 0;
         for(int i = propertyUri.length() - 1; propertyUri.charAt(i) != '/' && propertyUri.charAt(i) != '#'; i--)
             propSize++;
         String propertyNameUri = propertyUri.substring(propertyUri.length() - propSize, propertyUri.length());
         return propertyNameUri;
    }

    private String getPropertyNameSpace(String propertyUri) {
        int propSize = 0;
        for(int i = propertyUri.length() - 1; propertyUri.charAt(i) != '/' && propertyUri.charAt(i) != '#'; i--)
            propSize++;
        String propertyNameSpace = propertyUri.substring(0, propertyUri.length() - propSize);
        return propertyNameSpace;
    }


    private List<Vocabulary> getVocabularies(List<PrefixedPair> prefixedPairs) {
        List <PrefixedPair> usedVocabularies = getUsedVocabularies(prefixedPairs);
        List <Vocabulary> vocabularies = new ArrayList<>();
        for (PrefixedPair vocab: usedVocabularies){
            List<Pair> pairsForVocab = null;
            Vocabulary vocabulary = null;
            if (!vocabularyExists(vocabularies, vocab)){
                vocabulary = new Vocabulary();
                pairsForVocab =  new ArrayList<>();
                vocabulary.setPrefix(vocab.getPrefix());
                vocabulary.setUri(vocab.getUri());
                for (PrefixedPair prefixedPair: prefixedPairs) {
                    String vocabURI1 = vocabulary.getUri().substring(0, vocabulary.getUri().length() - vocabulary.getPrefix().length());
                    String vocabURI2 = prefixedPair.getUri().substring(0, prefixedPair.getUri().length() - prefixedPair.getPrefix().length());
                    if (vocabURI1.equals(vocabURI2))
                        pairsForVocab.add(prefixedPair.getPair());
                }
                vocabulary.setPairs(pairsForVocab);
                vocabularies.add(vocabulary);
            }
        }
        return vocabularies;
    }

    private List<PrefixedPair> getPrefixedPairs(Model model, Resource r) {
        List<Pair> pairs = new ArrayList<>();
        List<PrefixedPair> prefixedPairs = new ArrayList<>();
        StmtIterator propIter = r.listProperties();                                         //Pega todas as propriedades do recurso
        while (propIter.hasNext()) {                                                        //Enquanto tiver próxima propriedade
            Statement propStmt  = propIter.nextStatement();                                 //Pega a proxima propriedades
            Property prop       = propStmt.getPredicate();
            RDFNode object      = propStmt.getObject();                                     //


            String vocabURI = prop.getURI().substring(0, prop.getURI().length() - prop.getLocalName().length());
            String URIPrefix = model.getNsURIPrefix(vocabURI);

            if((object instanceof Resource && !prop.getLocalName().equals("type")) && !object.toString().contains("http://")) {
                Pair pairAsResource = new Pair(prop.getLocalName(), "", true, "");
                prefixedPairs.add(new PrefixedPair(URIPrefix, vocabURI, pairAsResource));

                pairs.add(pairAsResource);
            }

            if(!prop.getLocalName().equals("type")) {
                if (object instanceof Resource && !object.toString().contains("http://")) {
                    StmtIterator subpropIter = ((Resource) object).listProperties();
                    while (subpropIter.hasNext()) {
                        Statement subpropSmtm = subpropIter.nextStatement();
                        Property subp = subpropSmtm.getPredicate();
                        RDFNode subObjet = subpropSmtm.getObject();
                        if (subObjet.isResource()) {
                            Pair pair = new Pair(subp.getLocalName(), subObjet.toString(), true, prop.getLocalName());
                            prefixedPairs.add(new PrefixedPair(URIPrefix, vocabURI, pair));
                            pairs.add(pair);
                        } else {
                            Pair pair = new Pair(subp.getLocalName(), subObjet.toString(), false, prop.getLocalName());
                            prefixedPairs.add(new PrefixedPair(URIPrefix, vocabURI, pair));
                            pairs.add(pair);
                        }
                    }
                } else {
                    if (object.isResource()) {
                        Pair pair = new Pair(prop.getLocalName(), object.toString(), true, "");
                        prefixedPairs.add(new PrefixedPair(URIPrefix, vocabURI, pair));
                        pairs.add(pair);
                    } else {
                        Pair pair = new Pair(prop.getLocalName(), object.toString(), false, "");
                        prefixedPairs.add(new PrefixedPair( URIPrefix, vocabURI, pair));
                        pairs.add(pair);
                    }
                }
            }
        }
        return prefixedPairs;
    }

    private boolean vocabularyExists(List<Vocabulary> vocabularies, PrefixedPair prefixedPair){
        for(Vocabulary vocabulary: vocabularies){
            String vocabURI1 = vocabulary.getUri().substring(0, vocabulary.getUri().length() - vocabulary.getPrefix().length());
            String vocabURI2 = prefixedPair.getUri().substring(0, prefixedPair.getUri().length() - prefixedPair.getPrefix().length());
            if(vocabURI1.equals(vocabURI2)){
                return true;
            }
        }
        return false;
    }

    public List<PrefixedPair> getUsedVocabularies(List<PrefixedPair> prefixedPairs){

        List<PrefixedPair> usedVocabularies = new ArrayList();
        for (PrefixedPair prefixedPair: prefixedPairs){
            if (!usedVocabularies.contains(prefixedPair.getPrefix())){
                usedVocabularies.add(prefixedPair);
            }
        }
        return usedVocabularies;
    }

    /**
     * Method responsible for creating a new resource according to the data passed according to the predefined ontology
     * <br> The vocabularies, properties and values will be passed to create the new instance of the ontology
     * @param model Model that will receive the data of the new ontology to be created
     * @param resource A ResourceApi with data from the new ontology
     */
    public void addAsResource(Model model, ResourceApi resource) {
        Resource resourceDefiniton = ResourceFactory
                .createResource(resource.getAbout() +  resource.getName());
        Resource resourceInstance = model.createResource(getResourceID(resource), resourceDefiniton);

        for (Vocabulary v : resource.getVocabularies()) {
            ArrayList<Verified> verifiedPairs = new ArrayList<>();
            for(Pair p : v.getPairs()){
                verifiedPairs.add(new Verified(p));
            }
            for (int i = 0; i < verifiedPairs.size(); i++) {
                String propertyName = verifiedPairs.get(i).getPair().getPropertyName();
                //Represents the property like a a comom tag: <vocab:property>value</vocab:property>
                //If the pair was'nt verified yet and the value of his property isn't empty and the value of his property not contais "http://" and is a resource and the value of the subproperty is empty
                if (!verifiedPairs.get(i).isVerified()
                        && !verifiedPairs.get(i).getPair().getValue().isEmpty()
                        && !verifiedPairs.get(i).getPair().getValue().contains("http://")
                        && !verifiedPairs.get(i).getPair().isAsResource()
                        && verifiedPairs.get(i).getPair().getSubPropertyOf().isEmpty()){

                    Property property = ResourceFactory.createProperty(normalizeURI(v.getUri()), propertyName);
                    resourceInstance.addProperty(property, verifiedPairs.get(i).getPair().getValue());
                    verifiedPairs.get(i).setVerified(true);
                }
                //Represents the property that have one simple resource: <vocab:property rdf:resource="http://site.com"/>
                //If the pair was'nt verified yet and the value of his property contais "http://" and is a resource and the value of the subproperty is empty
                else if(!verifiedPairs.get(i).isVerified()
                        && verifiedPairs.get(i).getPair().getValue().contains("http://")
                        && verifiedPairs.get(i).getPair().isAsResource()
                        && verifiedPairs.get(i).getPair().getSubPropertyOf().isEmpty()){

                    Resource propResource = ResourceFactory
                            .createResource(verifiedPairs.get(i).getPair().getValue());
                    Property property = ResourceFactory.createProperty(normalizeURI(v.getUri()), propertyName);
                    model.add(resourceInstance, property, propResource);
                    verifiedPairs.get(i).setVerified(true);
                }
                //Represents the begins of a resource: <vocab:property rdf:parseType="Resource">
                //If the pair was'nt verified yet and the value of his property is empty and is a resource and the value of the subproperty is empty
                else if (!verifiedPairs.get(i).isVerified()
                        && verifiedPairs.get(i).getPair().getValue().isEmpty()
                        && verifiedPairs.get(i).getPair().isAsResource()
                        && verifiedPairs.get(i).getPair().getSubPropertyOf().isEmpty()) {
                    Property property = ResourceFactory.createProperty(normalizeURI(v.getUri()), propertyName);
//                    RDFNode innerNode =
                    Resource innerResource = model.createResource();
                    List<Pair> pairs = v.getPairs();
                    for (int k = 0; k < v.getPairs().size(); k++) {
                        //Treats the internal properties of the new resource included
                        //If the name of property of one pair is equals to the property name of another pair
                        if (verifiedPairs.get(i).getPair().getPropertyName().equals(pairs.get(k).getSubPropertyOf())) {
                            //Treats the case wich the subproperty is represented like a resource <vocab:property rdf:resource="http://anything.com"/
                            if(!pairs.get(k).getValue().equals("") && pairs.get(k).isAsResource()){
                                Property innerProperty = ResourceFactory.createProperty(normalizeURI(v.getUri()), pairs.get(k).getPropertyName());
                                Resource r = ResourceFactory.createResource(pairs.get(k).getValue());
                                model.add(innerResource, innerProperty, r);
                            }
                            //Treats the case wich the subproperty is represented like a comom tag: <vocab:property>value</vocab:property>
                            else{
                                Property innerProperty = ResourceFactory
                                        .createProperty(normalizeURI(v.getUri()), pairs.get(k).getPropertyName());
                                innerResource.addProperty(innerProperty, pairs.get(k).getValue());
                            }
                            verifiedPairs.get(k).setVerified(true);
                        }
                    }
                    resourceInstance.addProperty(property, innerResource);
                    verifiedPairs.get(i).setVerified(true);
                }
            }
        }
    }

    /**
     * Method responsible for normalizing the URI of the created resource by adding '/' if necessary
     * @param uri String that stores the URI
     * @return Returns a String from a normalized URI
     */
    private String normalizeURI(String uri) {
        return (uri.endsWith("/") || uri.endsWith("#")) ? uri : uri + "/";
    }

    /**
     * Method that generates a unique identifier to be coupled to the URI for a new instance of the ontology
     * @param resource ResourceApi resource passed to treat resource URI
     * @return Returns a String with the resource URI plus a unique identifier
     */
    private String getResourceID(ResourceApi resource) {
        return resource.getAbout() + UUID.randomUUID();
    }

    /**
     * Method responsible for creating a template that will receive the given data:
     * <br> Vocabularies with their respective prefixes and properties with their values
     * @param resource ResourceApi with the data to insert into the template
     * @return Returns a Model with the passed data
     */
    public Model createModel(ResourceApi resource) {
        Model model = ModelFactory.createDefaultModel();
        model.setNsPrefix(resource.getPrefix(), resource.getAbout());
        for (Vocabulary v : resource.getVocabularies()) {
            model.setNsPrefix(v.getPrefix(), normalizeURI(v.getUri()));
        }
        return model;
    }
}
