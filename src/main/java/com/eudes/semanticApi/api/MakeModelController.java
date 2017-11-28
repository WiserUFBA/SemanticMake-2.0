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
 * @since 10-2017
 */
@RestController
@RequestMapping(value = "/resources")
@Api(value="onlinestore", description="REST controller responsible for handling requests and responses to the client")
public class MakeModelController {

    /**
     * String that stores the URL of the Fuseki/DatasetName server to store the ontologies
     */
    private String fusekiURI = "http://localhost:3030/Teste";
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
     * @return Returns an HTTP 200 code code if the operation succeeds
     */
    @PostMapping
    @ApiOperation(value = "REST controller responsible for handling requests and responses to the client", response = ResponseEntity.class)
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Saves the resource successfully"),
            @ApiResponse(code = 401, message = "You are not authorized to view the resource"),
            @ApiResponse(code = 403, message = "Accessing the resource you were trying to reach is forbidden"),
            @ApiResponse(code = 404, message = "The resource you were trying to reach is not found")})
    public ResponseEntity saveResource(@RequestBody ResourceApi resource) {
        resource.setAbout(normalizeURI(resource.getAbout()));
        Model model = createModel(resource);
        addAsResource(model, resource);
        model.write(System.out);

        Random r = new Random();
        graphURI = "/workspace-" + UUID.randomUUID().toString().substring(0,8);
        datasetAccessor.add(graphURI, model);
        return ResponseEntity.ok(new APIResponse(graphURI, resource.getAbout()));
    }

    @DeleteMapping("/deleteResource")
    public ResponseEntity deleteResource(@RequestBody String workpace, @RequestBody String resouceID){

        String graphURI = "/" + workpace;
        DatasetAccessor datasetAccessor = DatasetAccessorFactory.createHTTP(fusekiURI);
        Model model = datasetAccessor.getModel(graphURI);
        model.removeAll(model.getResource(resouceID), null, null);
        datasetAccessor.putModel(graphURI, model);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/deleteGraph")
    public ResponseEntity deleteGraph (@RequestBody String workpace){

        String graphURI = "/" + workpace;
        DatasetAccessor datasetAccessor = DatasetAccessorFactory.createHTTP(fusekiURI);
        Model model = datasetAccessor.getModel(graphURI);
//        model.getGraph().clear();
        datasetAccessor.deleteModel(graphURI);
        return ResponseEntity.ok().build();
    }
    /**
     * Method responsible for retrieving predicates of vocabulary of interest according to the given term
     * @param vocabPrefix String with the prefix of the vocabulary in which the searches will be done
     * @param search String with the search term to find properties with similarity to the given term
     * @return Returns an HTTP status 'ok' with an OptGroup list. Each of these contains specific predicates of that group defined in the vocabulary. An example is Schema.org which has Product, Place, Person, Organization, Review, Action ...
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

    private void addResouceToModel(Model model, Verified v){

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
