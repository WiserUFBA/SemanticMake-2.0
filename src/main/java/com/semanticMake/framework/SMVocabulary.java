package com.semanticMake.framework;


import java.util.ArrayList;
import java.util.List;

/**
 * Class that is used to define the vocabulary structure defined by the client in JSON format
 * @author Eudes Souza
 * @since 10/2017
 */
public class SMVocabulary {

    /**
     * SMVocabulary URI
     */
    private String uri;
    /**
     * SMVocabulary prefix
     */
    private String prefix;
    /**
     * List of Pair - different values for (predicate, value)
     */
    private List<VProperty> properties = new ArrayList<>();

    /**
     * The object constructor
     * @param uri - The vocabulary URI
     * @param prefix - The vocabulary prefix
     * @param properties - The vocabulary properties
     */
    public SMVocabulary(String uri, String prefix, List<VProperty> properties) {
        this.uri = uri;
        this.prefix = prefix;
        this.properties = properties;
    }

    /**
     * The object constructor without the params
     */
    public SMVocabulary() {
    }

    /**
     * Get method to the resource URI
     * @return A string containing the resource URI value
     */
    public String getUri() {
        return this.uri;
    }

    /**
     * Get method to the resource URI
     * @return A string containing the vacabulary prefix value
     */
    public String getPrefix() {
        return this.prefix;
    }

    /**
     * This method should return the vocabulary properties
     * @return - A list of vocabulary properties
     */
    public List<VProperty> getProperties() {
        return this.properties;
    }

    /**
     * This method assign vocabulary URI
     * @param uri - The vocabulary URI to assign
     */
    public void setUri(String uri) {
        this.uri = uri;
    }

    /**
     * This method assign vocabulary URI
     * @param prefix - The vocabulary prefix to assign
     */
    public void setPrefix(String prefix) {
        this.prefix = prefix;
    }

    /**
     * This method assign the vocabulary properties
     * @param properties The vocabulary properties to assign
     */
    public void setProperties(List<VProperty> properties) {
        this.properties = properties;
    }

    /**
     * Indicates whether some other object is "equal to" this one
     * @param o - the reference object with which to compare
     * @return true if this object is the same as the obj argument; false otherwise
     */
    public boolean equals(Object o) {
        if(o == this) {
            return true;
        } else if(!(o instanceof SMVocabulary)) {
            return false;
        } else {
            SMVocabulary other = (SMVocabulary)o;
            if(!other.canEqual(this)) {
                return false;
            } else {
                label47: {
                    String this$uri = this.getUri();
                    String other$uri = other.getUri();
                    if(this$uri == null) {
                        if(other$uri == null) {
                            break label47;
                        }
                    } else if(this$uri.equals(other$uri)) {
                        break label47;
                    }

                    return false;
                }

                String this$prefix = this.getPrefix();
                String other$prefix = other.getPrefix();
                if(this$prefix == null) {
                    if(other$prefix != null) {
                        return false;
                    }
                } else if(!this$prefix.equals(other$prefix)) {
                    return false;
                }

                List this$pairs = this.getProperties();
                List other$pairs = other.getProperties();
                if(this$pairs == null) {
                    if(other$pairs != null) {
                        return false;
                    }
                } else if(!this$pairs.equals(other$pairs)) {
                    return false;
                }

                return true;
            }
        }
    }

    /**
     * The method should check the equality of objects
     * @param other Another object instance
     * @return true if the other object is an instance of the class in which canEqual is (re)defined, false otherwise
     */
    protected boolean canEqual(Object other) {
        return other instanceof SMVocabulary;
    }


    /**
     * Returns a hash code value for the object.
     * <br> This method is supported for the benefit of hash tables such as those provided by HashMap
     * @return a hash code value for this object
     */
    public int hashCode() {
        boolean PRIME = true;
        byte result = 1;
        String $uri = this.getUri();
        int result1 = result * 59 + ($uri == null?43:$uri.hashCode());
        String $prefix = this.getPrefix();
        result1 = result1 * 59 + ($prefix == null?43:$prefix.hashCode());
        List $pairs = this.getProperties();
        result1 = result1 * 59 + ($pairs == null?43:$pairs.hashCode());
        return result1;
    }

    /**
     * A method to print the object like string
     * @return A string that represents the resource
     */
    public String toString() {
        return "SMVocabulary(uri=" + this.getUri() + ", prefix=" + this.getPrefix() + ", pairs=" + this.getProperties() + ")";
    }
}
