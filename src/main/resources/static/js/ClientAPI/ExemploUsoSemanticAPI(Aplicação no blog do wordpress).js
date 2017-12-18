var btnSubmit = document.getElementById('buttonFormSubmit')
btnSubmit.onclick = function(event){
   event.preventDefault();
   const config = {
      baseURL: 'http://localhost:8080/',
      workspace: 'workspace-869f1a93'
   }
   const api = new SemanticAPI(config)
   const resource = new Resource('contactData', 'contact', 'http://contactmail.com#Person')
   resource.addVocabulary('schema', 'http://schema.org/')
   resource.addVocabulary('vcard', 'http://www.w3.org/2006/vcard/ns#')
   const emailValue = document.getElementById('inputEmail').value
   property = new Property('hasValue', 'email@email.com', false, 'email')
   resource.addProperty('vcard', property)
   /property1 = new Property('client', 'YahooMail', false, 'email')
   resource.addProperty('vcard', property1)
   const nameValue = document.getElementById('inputName').value
   property2  = new Property('name', 'Lucimar da Silva Souza', false, '')
   resource.addProperty('schema', property2)
   const subjectValue = document.getElementById('inputSubject').value
   property3 = new Property('about', 'Assunto do email', false, '')
   resource.addProperty('schema', property3)
   const telValue = document.getElementById('inputTel').value
   property4 = new Property ('telephone', '73991809696', false, '' )
   resource.addProperty('schema', property4)
   const messageValue = document.getElementById('inputMessage').value
   property5 = new Property('text', 'Mensagem do e-mail', false, '')
   resource.addProperty('schema', property5)
   resource.addCoordinatesDateTime()
   resource.addLanguage('pt-br');
   api.saveResource(resource)
      .then(json => alert(`Recurso salvo com sucesso\nSeu workspace é: ${json.workspace}\nO ID do recurso é: ${json.resourceId}`))
      .catch(error => alert(`Problema de conexão ao tentar salvar a ontologia\n${error.message}`))
   api.deleteGraph()
      .then(json => alert(`Workspace '${json.workspace}' foi removido`))
      .catch(error => alert(`Problema de conexão ao tentar deletar apagar workspace: ${error.message}`))
   api.deleteResource("http://qwer/dc64413c-0597-4c5e-bd3e-f743e7a2b5c7")
     .then(json => alert(`O recurso '${json.resourceId}' foi removido do workspce '${json.workspace}'`))
     .catch(error => alert(`Problema ao tentar deletar recurso: ${error.message}`))
   let now = new Date()
   now = now.getFullYear() + '/' + now.getMonth() + '/' + now.getDate() + ' ' + now.getHours() + ':' + now.getMinutes() + ':' + now.getSeconds()
   api.updateProperty('http://contactmail.com#Person/8ff4d538-a20a-4ba9-a51d-554357ecfcad', 'http://www.w3.org/2006/vcard/ns#client', 'Gmail')
    .then(json => alert(`A propriedade do recurso foi atualizada`))
    .catch(json => alert(`Falha ao tentar atualizar o recurso`))      
   api.updateProperty('http://contactmail.com#Person/8ff4d538-a20a-4ba9-a51d-554357ecfcad', 'http://schema.org/geocoordinates', '369852147')
   api.deleteProperty('http://contactmail.com#Person/affa9dce-7e1a-42ba-8fe8-2b96c40bcb5b', 'http://schema.org/geocoordinates')
   .then(json => alert(`A propriedade com URI '${json.propertyUri}', do recurso '${json.resourceId}', do workspace '${json.workspace}', foi removida`))
   .catch(error => alert(`Problema de conexão ao tentar deletar propriedade: ${error.message}`))
   api.getResource("http://contactmail.com#Person/0d608605-b10b-4833-91d2-00ec1755c335")
   .then(resource => { alert(`O recurso '${resource.about}' foi retornado`)})
   .catch(error => alert(`Problema de conexão ao tentar recuperar o recurso: ${error.message}`))
   api.getResources('http://schema.org/name', 'Souza', false)
   .then(resources => console.log(resources))
   .catch(err => alert(`Problema ao tentar recuperar recursos ${err.msg}`))
}   