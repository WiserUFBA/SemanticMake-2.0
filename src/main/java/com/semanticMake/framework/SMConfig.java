package com.semanticMake.framework;

import lombok.Data;

/** Config has variables with values needed to the inner methods operation
 * Created by Eudes on 16/05/2018.
 */
@Data
public class SMConfig {

    private String baseURL;

    private String datasetAddress;

    private String datasetName;

    private String workspace;

    public SMConfig(){
        this.baseURL = baseURL;
    }

    /**
     * The contructor holds the values to config the application addresses
     * @param baseURL The application URL
     * @param datasetAddress The datasetAdress
     * @param datasetName The dasetName in the triple store
     * @param workspace The graph name ni the dataset
     */
    public SMConfig(String baseURL, String datasetAddress, String datasetName, String workspace) {
        this.baseURL = baseURL;
        this.datasetAddress = datasetAddress;
        this.datasetName = datasetName;
        this.workspace = workspace;
    }

     /**
     * Retrieves the graph where is it working
     * @return A String containing the workspace (graph name)
     */
    public String getWorkspace() {
        return workspace;
    }

    /**
     * Assign the value to the worskspace name
     * @param workspace A String containing the workspace name
     */
    public void setWorkspace(String workspace) {
        this.workspace = workspace;
    }

    /**
     * Retrieves the dataset name
     * @return A string containing the dataset name
     */
    public String getDatasetName() {
        return datasetName;
    }

    /**
     * Assign the dataset name
     * @param datasetName A string containing the dataset name
     */
    public void setDatasetName(String datasetName) {
        this.datasetName = datasetName;
    }

    /**
     * Retrieve the dataset address
     * @return A string containing the dataset address
     */
    public String getDatasetAddress() {
        return datasetAddress;
    }

    /**
     * Assign the dataset address
     * @param datasetAddress A string contaning the dataset address
     */
    public void setDatasetAddress(String datasetAddress) {
        this.datasetAddress = datasetAddress;
    }

    /**
     * Retrieves the URL which keep the aplication
     * @return A string containing the base URL for the application
     */
    public String getBaseURL() {
        return baseURL;
    }

    /**
     * Assign the URL which will keep the application
     * @param baseURL A string containing the URL for application
     */
    public void setBaseURL(String baseURL) {
        this.baseURL = baseURL;
    }
}
