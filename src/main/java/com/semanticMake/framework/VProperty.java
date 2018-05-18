package com.semanticMake.framework;

import java.beans.ConstructorProperties;

/**
 * Class that is used to define the structure of the pair (predicate, value) defined by the client in JSON format
 * @author Eudes Souza
 * @since 10/2017
 */
public class VProperty {
    private String propertyName;
    private String value;
    private boolean asResource;
    private String subPropertyOf;

    /**
     * The constructor
     * @param propertyName - The property name
     * @param value - The property value
     * @param asResource - The value that represents if the resource must be represented like a resource
     * @param subPropertyOf - The parent property
     */
    @ConstructorProperties({"propertyName", "value", "asResource", "subPropertyOf"})
    public VProperty(String propertyName, String value, boolean asResource, String subPropertyOf) {
        this.propertyName = propertyName;
        this.value = value;
        this.asResource = asResource;
        this.subPropertyOf = subPropertyOf;
    }

    /**
     * This method should return the property name
     * @return - A string with the property name
     */
    public String getPropertyName() {
        return this.propertyName;
    }

    /**
     * This method should return the property value
     * @return - A string with the property value
     */
    public String getValue() {
        return this.value;
    }

    /**
     * Verify if the resource must be represented like a resource
     * @return true if this object must be represented like a resource; false otherwise
     */
    public boolean isAsResource() {
        return this.asResource;
    }

    /**
     * This method should return the parent subproperty
     * @return - A string with the parent subproperty
     */
    public String getSubPropertyOf() {
        return this.subPropertyOf;
    }

    /**
     * This method assign the property name
     * @param propertyName - The property name
     */
    public void setPropertyName(String propertyName) {
        this.propertyName = propertyName;
    }

    /**
     * This method assign the property value
     * @param value - The property value
     */
    public void setValue(String value) {
        this.value = value;
    }

    /**
     * This method assign if the resource must be represented like a resource
     * @param asResource - true if property must be represented like a resouce, false otherwise
     */
    public void setAsResource(boolean asResource) {
        this.asResource = asResource;
    }

    /**
     * This method assign the parent property
     * @param subPropertyOf - The parent property
     */
    public void setSubPropertyOf(String subPropertyOf) {
        this.subPropertyOf = subPropertyOf;
    }

    public boolean equals(Object o) {
        if(o == this) {
            return true;
        } else if(!(o instanceof VProperty)) {
            return false;
        } else {
            VProperty other = (VProperty)o;
            if(!other.canEqual(this)) {
                return false;
            } else {
                String this$propertyName = this.getPropertyName();
                String other$propertyName = other.getPropertyName();
                if(this$propertyName == null) {
                    if(other$propertyName != null) {
                        return false;
                    }
                } else if(!this$propertyName.equals(other$propertyName)) {
                    return false;
                }

                String this$value = this.getValue();
                String other$value = other.getValue();
                if(this$value == null) {
                    if(other$value != null) {
                        return false;
                    }
                } else if(!this$value.equals(other$value)) {
                    return false;
                }

                if(this.isAsResource() != other.isAsResource()) {
                    return false;
                } else {
                    String this$subPropertyOf = this.getSubPropertyOf();
                    String other$subPropertyOf = other.getSubPropertyOf();
                    if(this$subPropertyOf == null) {
                        if(other$subPropertyOf != null) {
                            return false;
                        }
                    } else if(!this$subPropertyOf.equals(other$subPropertyOf)) {
                        return false;
                    }

                    return true;
                }
            }
        }
    }

    /**
     * The method should check the equality of objects
     * @param other Another object instance
     * @return true if the other object is an instance of the class in which canEqual is (re)defined, false otherwise
     */
    protected boolean canEqual(Object other) {
        return other instanceof VProperty;
    }

    /**
     * Returns a hash code value for the object.
     * <br> This method is supported for the benefit of hash tables such as those provided by HashMap
     * @return a hash code value for this object
     */
    public int hashCode() {
        boolean PRIME = true;
        byte result = 1;
        String $propertyName = this.getPropertyName();
        int result1 = result * 59 + ($propertyName == null?43:$propertyName.hashCode());
        String $value = this.getValue();
        result1 = result1 * 59 + ($value == null?43:$value.hashCode());
        result1 = result1 * 59 + (this.isAsResource()?79:97);
        String $subPropertyOf = this.getSubPropertyOf();
        result1 = result1 * 59 + ($subPropertyOf == null?43:$subPropertyOf.hashCode());
        return result1;
    }

    /**
     * A method to print the object like string
     * @return A string that represents the resource
     */
    public String toString() {
        return "Property(propertyName=" + this.getPropertyName() + ", value=" + this.getValue() + ", asResource=" + this.isAsResource() + ", subPropertyOf=" + this.getSubPropertyOf() + ")";
    }


}
