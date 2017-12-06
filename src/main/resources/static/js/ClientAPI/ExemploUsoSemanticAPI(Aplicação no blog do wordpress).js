
   var btnSubmit = document.getElementById('buttonFormSubmit')
   btnSubmit.onclick = function(event){
      event.preventDefault()
      const config = {
      baseURL: 'http://localhost:8080/'
      }
      const api = new SemanticAPI(config)
      const resource = new Resource('contactData', 'contact', 'http://contactmail.com#Person')
      resource.addVocabulary('schema', 'http://schema.org/')
      resource.addVocabulary('vcard', 'http://www.w3.org/2006/vcard/ns#')
      const emailValue = document.getElementById('inputEmail').value
      resource.addTriple('vcard', 'hasValue', emailValue, false, 'hasValue')
      const nameValue = document.getElementById('inputName').value
      resource.addTriple('schema', 'name', nameValue, false, '')
      const subjectValue = document.getElementById('inputSubject').value
      resource.addTriple('schema', 'about', subjectValue, false, '')
      const telValue = document.getElementById('inputTel').value
      resource.addTriple('schema', 'telephone', telValue, false, '' )
      const messageValue = document.getElementById('inputMessage').value
      resource.addTriple('schema', 'text', messageValue, false, '')
      resource.addCoordinatesDateTime()
      resource.addLanguage('pt-br');
      api.saveResource(resource, 'workspace')
      .then(json =>
      alert(`Recurso salvo com sucesso\nSeu workspace é: ${json.workspace}\nO ID do recurso é: ${json.resourceID}`))
      .catch(error =>
      alert(`Problema de conexão ao tentar salvar a ontologia\n${error.message}`))
   }