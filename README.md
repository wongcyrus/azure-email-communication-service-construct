# Azure Email Communication Service Construct
This project tries to create Email Service in Azure Communication Services. However, it still requires manual task to create Managed Domain and connnet it as there is no API or AZ commands for the preview services.


## How to deploy it?

```
git clone https://github.com/wongcyrus/azure-email-communication-service-construct
cd azure-email-communication-service-construct
npm i 
cdktf deploy --auto-approve
cdktf output --outputs-file-include-sensitive-outputs --outputs-file secrets.json
```

## Manual Tasks