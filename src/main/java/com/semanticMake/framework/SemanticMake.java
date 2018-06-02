package com.semanticMake.framework;

import com.semanticMake.semanticApi.api.SMController;
import org.apache.jena.query.DatasetAccessor;
import org.apache.jena.query.DatasetAccessorFactory;
import org.apache.jena.rdf.model.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * This class was made to aid developers to create semantic data more easely and to persist them.
 * <br> Many commom operations are encapsulated to facilitate the development. There are methods to assembly a new
 * <br> resource (ontology instance) with her URI, prefix, type, vocabularies and properties. It is also possible
 * <br> retrieve complete resources, to update or delete properties, to delete graphs or datasets.
 * <br> In addition to the operations solutions already presented, other functionalities can be added with the solutions
 * <br> already presented througth the class extensions of this framework.
 * @author Eudes Souza
 * @since 05/2018
 */
public class SemanticMake {

    /**
     * Controller instance
     */
    private SMController controller = null;

    /**
     * Config instance
     */
    private SMConfig config;

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
     * Start SMController with one SMConfig object
     * @param config One object SMConfig containing the initial configuration
     */
    public SemanticMake(SMConfig config) {

        this.config = new SMConfig();
        datasetAccessor = DatasetAccessorFactory.createHTTP(fusekiURI);
        this.controller = new SMController();

        try {
            if(config.getBaseURL() == null || config.getBaseURL() == "")
                config.setBaseURL("http://localhost:8080");
            if(config.getDatasetAddress() == null || config.getDatasetAddress() == "")
                config.setDatasetAddress("http://localhost:3030");
            if(config.getDatasetName() == null || config.getDatasetName() == "")
                config.setDatasetAddress("SemanticContent");
            if(config.getWorkspace() == null || config.getWorkspace() == "")
                config.setWorkspace("empty");
            this.config = config;
        } catch (NullPointerException e) {
            System.out.print("Was not possible to make the config because the object or the baseURL member is is null!\n");
            e.printStackTrace();
        }
    }

    /**
     * Function to assign one and only one instance to this object
     * @return A controller
     */
    public SMController getController(){
        if (this.controller == null)
            this.controller = new SMController();
        return this.controller;
    }

    /**
     * Method responsible for assign the triple store address e the dataset name
     * @param datasetAddress String to hold the triple store address
     * @param datasetName String to hold the dataset name
     * @return Returns a string the shows the state of operation
     */
    public String setTripleStoreAddres(String datasetAddress, String datasetName){
        try{
            controller.setTripleStoreAddres(datasetAddress, datasetName);
        }catch (Exception e){
            return e.getMessage();
        }
        return "Success";
    }

    /**
     * Method responsible for receiving and to persist the mounted resource previously defined by one ontology
     * <br> When using this method it is assumed that the ontology structure is the same as shown in the ontology
     * <br> assembly application, with four forms available for a property
     * <br> The resource is passed in JSON format
     * @param resource Resource passed by client
     * @param workspace Returns a ResponseEntity containing a APIResponse
     * @return Returns a string the shows the state of operation
     */
    public String saveResource(SMResource resource, String workspace){
        resource.setAbout(controller.normalizeURI(resource.getAbout()));
        Model model = controller.createModel(resource);
        controller.addAsResource(model, resource);
        model.write(System.out);
        String resourceId  = "";

        StmtIterator iter = model.listStatements();
        while(iter.hasNext() && !resourceId.contains("http://")){
            resourceId  = iter.nextStatement().getSubject().toString();
        }

        String graphURI = (workspace.charAt(0) == '/')? workspace : "/" + workspace;
        controller.setGraphURI(graphURI);
        try{
            if(controller.getDatasetAccessor().getModel(graphURI) == null)
                graphURI = "/workspace-" + UUID.randomUUID().toString().substring(0,8);
            controller.getDatasetAccessor().add(graphURI, model);
        }catch (Exception e){
            System.out.println("Could'nt retrieve template with passed workspace: " + e.getMessage());
        }
        controller.getDatasetAccessor().add(graphURI, model);
        return "Success";
    }

    /**
     * Method responisble for delete one especified resource
     * @param workspace String to hold the name of the workspace where the resource is
     * @param resourceId String to hold the ID of the resource to be deleted
     * @return Returns a string the shows the state of operation
     */
    public String deleteResource(String workspace, String resourceId){
        String graphURI = (workspace.charAt(0) == '/')? workspace : "/" + workspace;
        controller.setGraphURI(graphURI);
        Model model = controller.getDatasetAccessor().getModel(graphURI);
        Resource r = model.getResource(resourceId);
        StmtIterator iter = r.listProperties();
        List<Statement> innerResources = new ArrayList<>();
        while (iter.hasNext()) {
            Statement stmt      = iter.nextStatement();
            RDFNode object      = stmt.getObject();
            if (object instanceof Resource && !object.toString().contains("http://")) {
                innerResources.add(stmt);
            }
        }
        for (Statement innerResource : innerResources){
            ((Resource)innerResource.getObject()).removeProperties();
            model.remove(r, innerResource.getPredicate(), innerResource.getObject());
        }

        try{
            r.removeProperties();
            controller.getDatasetAccessor().putModel(graphURI, model);
        }catch (Exception e){
            System.out.println("Could'nt to delete the resource: " + e.getMessage());
        }
        return "Succes";
    }

    /**
     * Method responsible for to delete one specifc graph given his name that we call workspace
     * @param workspace String to hold the name of the workspace to be deleted
     * @return Returns a ResponseEntity containing a APIResponse
     */
    public String deleteGraph (String workspace){
        String graphURI = (workspace.charAt(0) == '/')? workspace : "/" + workspace;
        controller.setGraphURI(graphURI);
//        Model model = datasetAccessor.getModel(graphURI);
//        model.getGraph().clear();
        try{
            controller.getDatasetAccessor().deleteModel(graphURI);
        }catch (Exception e){
            System.out.println("Could'nt to delete the graph:" + e.getMessage());
        }
        return "Success";
    }

    /**
     * Method responsible for to delete one specifc property in a resource
     * @param workspace String to hold the graph name that contains the resource
     * @param resourceId String to hold the resource URI
     * @param propertyUri String to hold the property URI that will be deleted
     * @return Returns a ResponseEntity containing a APIResponse
     */
    public String deleteProperty(String workspace, String resourceId, String propertyUri){
        String graphURI = (workspace.charAt(0) == '/')? workspace : "/" + workspace;
        Model model = controller.getDatasetAccessor().getModel(graphURI);
        Resource subject = model.getResource(resourceId);
        String propertyURI = controller.getPropertyNameSpace(propertyUri);
        String propertyName = controller.getPropertyName(propertyUri);
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
        controller.getDatasetAccessor().putModel(graphURI, model);
        return "Success";
    }

    /**
     * Method responsible for to update one specifc property in a resource
     * @param workspace String to hold the graph name that contains the resource
     * @param resourceId String to hold the resource URI
     * @param propertyUri String to hold the property that will be deleted
     * @param newValue String to hold the new value to assign to the property
     * @return Returns a string the shows the state of operation
     */
    public String updateProperty(String workspace, String resourceId, String propertyUri, String newValue){
        String graphURI = (workspace.charAt(0) == '/')? workspace : "/" + workspace;
        controller.setGraphURI(graphURI);
        Model model = controller.getDatasetAccessor().getModel(graphURI);
        Resource subject        = model.getResource(resourceId);
        String propertyURI      = controller.getPropertyNameSpace(propertyUri);
        String propertyName     = controller.getPropertyName(propertyUri);
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
            try{
                controller.getDatasetAccessor().putModel(graphURI, model);
            }catch(Exception e){
                System.out.println("Could'nt to update the property:" + e.getMessage());
            }
        }
        return "Success";
    }

    /**
     * Method that retorns a list of resources given one URI of hid property and his respective value
     * @param workspace String to hold the graph name that will be passed
     * @param propertyUri String to hold the property URI
     * @param value String to hold the property value
     * @param isExactly Boolean used to determine if the passed value must be considered exactly like was passed
     *                  or if must only to contain the value passed on the property
     * @return Returns a string the shows the state of operation
     */
    public List<SMResource> getResources(String workspace, String propertyUri, String value, boolean isExactly){
        String graphURI = (workspace.charAt(0) == '/')? workspace : "/" + workspace;
        controller.setGraphURI(graphURI);
        Model model = controller.getDatasetAccessor().getModel(graphURI);
        String propertyURI = controller.getPropertyNameSpace(propertyUri);
        String propertyName = controller.getPropertyName(propertyUri);
        Property prop = ResourceFactory.createProperty(propertyURI, propertyName);
        ResIterator iter = model.listResourcesWithProperty(prop);
        List<SMResource> resources = new ArrayList<>();
        while(iter.hasNext()){
            Resource resource = iter.nextResource();
            StmtIterator stmt = resource.listProperties();
            while(stmt.hasNext()){
                Statement triple = stmt.nextStatement();
                Property predicate = triple.getPredicate();
                RDFNode object = triple.getObject();
                boolean propertyHasValue = (isExactly)? object.toString().equals(value) : object.toString().contains(value);
                if( propertyHasValue && predicate.equals(prop)){
                    SMResource smResource = controller.getSMResource(workspace, resource.getURI());
                    if (smResource != null) resources.add(smResource);
                } else if (object instanceof Resource && !object.toString().contains("http://")){
                    StmtIterator subIter = ((Resource) object).listProperties();
                    while(subIter.hasNext()){
                        Statement subTriple = subIter.nextStatement();
                        Property subProp = subTriple.getPredicate();
                        RDFNode subObject = subTriple.getObject();
                        boolean subpropertyHasValue = (isExactly)? subObject.toString().equals(value) : subObject.toString().contains(value);
                        if(subpropertyHasValue && subProp.equals(prop)) {
                            SMResource smResource = controller.getSMResource(workspace, resource.getURI());
                            if (smResource != null) resources.add(smResource);
                        }
                    }
                }
            }
        }
        return resources;
    }

    /**
     * Method responsible for obtaining a list of resources given the resource type
     * @param workspaces A string list that hold the graphs names that contain the resource searched
     * @param type String to hold the resource type
     * @return Returns a string the shows the state of operation
     */
    public List<SMResource> getResourcesByType(List<String> workspaces, String type){
        List<SMResource> SMResource = new ArrayList<>();

        for (String workspace:  workspaces) {
            String graphURI = (workspace.charAt(0) == '/')? workspace : "/" + workspace;
            Model model = controller.getDatasetAccessor().getModel(graphURI);

            ResIterator resIter = model.listSubjects();
            List<Resource> resources = new ArrayList<>();
            while(resIter.hasNext()){
                Resource resource = resIter.nextResource();
                try{
                    if (resource.getURI().contains("http://"))
                        resources.add(resource);
                }catch (Exception e){
                    System.out.println("Could'nt to retrieve the resources:" + e.getMessage());
                }
            }
            for(Resource resource: resources){
                if (controller.getResourceTypeName(resource).equals(type)){
                    com.semanticMake.framework.SMResource r =  controller.getSMResource(workspace, resource.getURI());
                    SMResource.add(r);
                }
            }
        }
        return SMResource;
    }

    /**
     * Method for obtaining a resource given his URI
     * @param workspace String to hold the graph nome that contain the resource searched
     * @param resourceId String to hold the resource ID searched
     * @return Returns a string the shows the state of operation
     */
    public SMResource getResource(String workspace, String resourceId) {
        SMResource resource= null;
        try{
            resource = controller.getSMResource(workspace, resourceId);
        }catch (Exception e){
            System.out.println("Could'nt to retrieve the resource:" + e.getMessage());
        }
        return resource;
    }

    /**
     * Method that generates a unique identifier to be coupled to the URI for a new instance of the ontology
     * @param resource SMResource resource passed to treat resource URI
     * @return Returns a String with the resource URI plus a unique identifier
     */
    private String getResourceID(SMResource resource) {
        return resource.getAbout() + UUID.randomUUID();
    }
}
