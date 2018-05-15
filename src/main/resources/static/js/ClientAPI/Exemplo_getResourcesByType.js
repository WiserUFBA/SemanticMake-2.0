
    var btnSubmit = document.getElementById('buttonFormSubmit')
    btnSubmit.onclick = function(event){
        event.preventDefault();
        const config = {
            baseURL: 'http://localhost:8080/',
            workspace: 'workspace-5f833b81'
        }
        const api = new SemanticAPI(config)
        var workspaces = []
        workspaces.push("/workspace")
        workspaces.push("/workspace-84b4df42")
        api.getResourcesByType(workspaces, "TypeResource")
        .then(resources => console.log(resources))
        .catch(err => 'Erro ao tentar recuperar recursos por tipo')
    }
