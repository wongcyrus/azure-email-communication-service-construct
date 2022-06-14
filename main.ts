import { Construct } from "constructs";
import { App, TerraformOutput, TerraformStack } from "cdktf";
import { AzurermProvider, ResourceGroup, CommunicationService, TemplateDeployment } from "cdktf-azure-providers/.gen/providers/azurerm";
import { StringResource } from 'cdktf-azure-providers/.gen/providers/random'

class AzureEmailStack extends TerraformStack {
  constructor(scope: Construct, name: string) {
    super(scope, name);
    new AzurermProvider(this, "AzureRm", {
      features: {
        resourceGroup: {
          preventDeletionIfContainsResources: false
        }
      }
    })

    const prefix = "AzureEmailCommunicationService"
    const environment = "dev"

    const resourceGroup = new ResourceGroup(this, "ResourceGroup", {
      location: "EastAsia",
      name: prefix + "ResourceGroup"
    })
    const suffix = new StringResource(this, "Random", {
      length: 5,
      special: false,
      lower: true,
      upper: false,
    })
    const communicationService = new CommunicationService(this, "CommunicationService", {
      name: prefix.toLocaleLowerCase() + environment.toLocaleLowerCase() + suffix.result + "communicationservice",
      resourceGroupName: resourceGroup.name,
    })

    new TemplateDeployment(this, "EmailCommunicationServiceTemplate", {
      name: prefix.toLocaleLowerCase() + environment.toLocaleLowerCase() + suffix.result + "emailcommunicationservice",
      resourceGroupName: resourceGroup.name,
      templateBody: `{
        "$schema": "http://schema.management.azure.com/schemas/2014-04-01-preview/deploymentTemplate.json#",
        "contentVersion": "1.0.0.0",
        "parameters": {
            "name": {
                "type": "string"
            },
            "dataLocation": {
                "type": "string"
            }
        },
        "resources": [
            {
                "apiVersion": "2021-10-01-preview",
                "name": "[parameters('name')]",
                "location": "global",
                "type": "Microsoft.Communication/emailServices",
                 "properties": {
                    "dataLocation": "[parameters('dataLocation')]"
                }
            }
        ]
    }`,
      parameters: {
        name: prefix.toLocaleLowerCase() + environment.toLocaleLowerCase() + suffix.result + "emailcommunicationservice",
        dataLocation: "United States"
      },
      deploymentMode: "Incremental"
    })

    new TerraformOutput(this, "CommunicationServiceConnectionString", {
      sensitive: true,
      value: communicationService.primaryConnectionString
    });

    // AzureEmailResourceGroup

    new TerraformOutput(this, "AzureEmailResourceGroup", {     
      value: resourceGroup.name,
    });
  }
}

const app = new App({ skipValidation: true });
new AzureEmailStack(app, "azure-email-communication-service-construct");
app.synth();
