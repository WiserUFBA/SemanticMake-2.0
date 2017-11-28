var btnSubmit = document.getElementById('buttonFormSubmit')
btnSubmit.onclick = function(event){
   event.preventDefault();
   const config = { 
     baseURL: 'http://localhost:8080/'
   }
   const api = new SemanticAPI(config)
   const resource = new Resource('contactData', 'contact', 'http://contactmail.com#Person')
   resource.addVocabulary('schema', 'http://schema.org/')
   const emailValue = document.getElementById('inputEmail').value
   resource.addTriple('schema', 'email', emailValue)
   const nameValue = document.getElementById('inputName').value
   resource.addTriple('schema', 'name', nameValue)
   const subjectValue = document.getElementById('inputSubject').value
   resource.addTriple('schema', 'about', subjectValue)
   const telValue = document.getElementById('inputTel').value
   resource.addTriple('schema', 'telephone', telValue )
   const messageValue = document.getElementById('inputMessage').value
   resource.addTriple('schema', 'text', messageValue)
   const resourceToSend = resource.getResourceToSend()
   api.saveResource(resourceToSend)
     .then(json =>           
            alert(`Recurso salvo com sucesso\nSeu workspace é: ${json.workspace}\nO ID do recurso é: ${json.resourceID}`))
     .catch(error => 
        alert(`Problema de conexão ao tentar salvar a ontologia\n${error.message}`))
 }