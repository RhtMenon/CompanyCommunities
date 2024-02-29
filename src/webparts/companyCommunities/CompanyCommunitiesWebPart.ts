import { Version } from '@microsoft/sp-core-library';
import { IPropertyPaneConfiguration, PropertyPaneDropdown, PropertyPaneSlider, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { HttpClient, SPHttpClient, SPHttpClientResponse } from '@microsoft/sp-http';

import styles from './CompanyCommunitiesWebPart.module.scss';
import * as strings from 'CompanyCommunitiesWebPartStrings';

import {app} from '@microsoft/teams-js'; 

export interface ICompanyCommunitiesWebPartProps {
  description: string;
  numberOfBlocks: number;
  selectedList: string;
  availableLists: { key: string; text: string }[];
  seeAllButton: string;
}

export default class CompanyCommunitiesWebPart extends BaseClientSideWebPart<ICompanyCommunitiesWebPartProps> {
  private communityInfo: any[] = [];

  private isTeams = false;
  private isEmbedded = false;
  protected async onInit(): Promise<void> {
    try {
      await app.initialize();
      const context = await app.getContext();
      console.log("Context:", context);
      if(context.app.host.name.includes("teams") || context.app.host.name.includes("Teams")){
        console.log("The extension is running inside Microsoft Teams");
        this.isTeams = true;
      }else{
        console.log("The extension is running outside Microsoft Teams");
      }
    } catch (exp) {
        console.log("The extension is running outside Microsoft Teams");
  }
  this.isEmbedded = document.body.classList.contains('embedded');
  if (this.isEmbedded) {
    console.log('Body has the embedded class');
  } else {
    console.log('Body does not have the embedded class');
  }
    await this.userDetails();
    await this._getCompanyFromEmail();
    await this.getAvailableLists();
    await this.getCommunityInfo();
  }

  public render(): void {
    const decodedSeeAllButton = decodeURIComponent(this.properties.seeAllButton);
    console.log("Url for See All button: ", decodedSeeAllButton);
  
    this.domElement.innerHTML = `
      <div>
        <div class="${styles.topSection}">
          <div class="${styles.CompanyCommunitiesHeading}">Company Communities</div>
          <div><a href="${decodedSeeAllButton}" target="_blank">See all</a></div>
        </div>
        <section class="${styles.CompanyCommunities}">
          ${this.communityInfo.slice(0, this.properties.numberOfBlocks).map((group: any, index: number) => {
  
            // Check if webUrl is an object and use the Url property if available
            const href = (group.webUrl && typeof group.webUrl === 'object') ? group.webUrl.Url || '' : group.webUrl || '';
            
            console.log("Group WebUrl:", group.webUrl.Url);
                let fullLink = "";
                if (group.webUrl.Url && group.webUrl.Url.includes("groups/")) {
                    let splitUrl = group.webUrl.Url.split("groups/")[1];
                    console.log("SplitUrl:", splitUrl);
                    let teamsLink1 = "https://teams.microsoft.com/l/entity/db5e5970-212f-477f-a3fc-2227dc7782bf/vivaengage?context=%7B%22subEntityId%22:%22type=custom,data=group:";
                    let teamsLink2 = "%22%7D";
                    fullLink = teamsLink1 + splitUrl + teamsLink2;
                    console.log("Full Link:", fullLink);
                }
                let link = "";

                if(this.isTeams && this.isEmbedded){
                  link = fullLink;
                }else if(!this.isTeams && this.isEmbedded){
                  link = "https://aka.ms/VivaEngage/Outlook";
                }else{
                  link = group.webUrl.Url;
                }
 
            return `
              <div class="${styles.col}">
                <div class="${styles.ContentBox}">
                  <div class="${styles.ImgPart}">
                    <a href="${link}" target="_blank">
                      <img src="${group.mugshotUrlTemplate}" alt="${group.fullName}">
                    </a>
                  </div>
                  <div class="${styles.Contents}">
                  <h3 onclick="window.open('${link}')">${group.fullName}</h3>
                    <p>${group.description}</p>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </section>
      </div>
    `;
  }
  
  private userEmail: string = "";

  private async userDetails(): Promise<void> {
    // Ensure that you have access to the SPHttpClient
    const spHttpClient: SPHttpClient = this.context.spHttpClient;
  
    // Use try-catch to handle errors
    try {
      // Get the current user's information
      const response: SPHttpClientResponse = await spHttpClient.get(`${this.context.pageContext.web.absoluteUrl}/_api/SP.UserProfiles.PeopleManager/GetMyProperties`, SPHttpClient.configurations.v1);
      const userProperties: any = await response.json();
  
      console.log("User Details:", userProperties);
  
      // Access the userPrincipalName from userProperties
      const userPrincipalNameProperty = userProperties.UserProfileProperties.find((property: any) => property.Key === 'SPS-UserPrincipalName');
  
      if (userPrincipalNameProperty) {
        this.userEmail = userPrincipalNameProperty.Value.toLowerCase();
        console.log('User Email using User Principal Name:', this.userEmail);
        // Now you can use this.userEmail as needed
      } else {
        console.error('User Principal Name not found in user properties');
      }
    } catch (error) {
      console.error('Error fetching user properties:', error);
    }
  }
  
  private company: string = "";

  private async _getCompanyFromEmail(): Promise<void> {

    console.log("User Email:", this.userEmail);
    if(this.userEmail.includes("@aciesinnovations.com"))
    {
      console.log("User belongs to acies");
      this.company = "acies"
    }else if(this.userEmail.includes("_zensar.com") || this.userEmail.includes("@zensar.")){
      console.log("User belongs to zensar");
      this.company = "zensar";
    }else if(this.userEmail.includes("@rpg.com") || this.userEmail.includes("@rpg.in")){
      console.log("User belongs to rpg");
      this.company = "rpg";
    }else if(this.userEmail.includes("@ceat.com")){
      console.log("User belongs to ceat");
      this.company = "ceat";
    }else if(this.userEmail.includes("_harrisonsmalayalam.com") || this.userEmail.includes("@harrisonsmalayalam.com")){
      console.log("User belongs to harrison");
      this.company = "harrisonsmalayalam";
    }else if(this.userEmail.includes("@kecrpg.com")){
      console.log("User belongs to kec");
      this.company = "kecrpg";
    }else if(this.userEmail.includes("@raychemrpg.com")){
      console.log("User belongs to raychem");
      this.company = "raychemrpg";
    }else if(this.userEmail.includes("@rpgls.com")){
      console.log("User belongs to rpgls");
      this.company = "rpgls";
    }
}


  private async getAvailableLists() {
    try {
      const response = await this.context.httpClient.get(
        `${this.context.pageContext.web.absoluteUrl}/_api/web/lists?$filter=Hidden eq false`,
        HttpClient.configurations.v1,
        {
          headers: {
            Accept: 'application/json;odata=nometadata',
          },
        }
      );
  
      const data = await response.json();
      this.properties.availableLists = data.value.map((list: any) => ({
        key: list.Title,
        text: list.Title,
      }));
  
      // Update the property pane dropdown options
      this.context.propertyPane.refresh();
    } catch (error) {
      console.error('Error fetching available lists:', error);
    }
  }
  
  

  private async getCommunityInfo() {
    if (!this.properties.selectedList || this.properties.selectedList.trim() === '') {
      console.warn('No valid list selected.');
      return;
    }
  
    try {
      const response = await this.context.httpClient.get(
        `${this.context.pageContext.web.absoluteUrl}/_api/web/lists/getbytitle('${this.properties.selectedList}')/items?$filter=Company eq '${this.company}' and IsCompanyCommunity eq 1`,
        HttpClient.configurations.v1,
        {
          headers: {
            Accept: 'application/json;odata=nometadata',
          },
        }
      );
  
      const data = await response.json();
  
      if (data && data.value) {
        this.communityInfo = data.value.map((item: any) => {
          
          console.log('Mugshot URL from SharePoint:', item.MugShotURL);
  
          return {
            fullName: item.Title,
            description: item.CommunityDescription,
            webUrl: item.CommunityURL,
            mugshotUrlTemplate: item.MugShotURL,
          };
        });
      } else {
        console.error('Data not found in the SharePoint list or no items match the filter condition.');
      }
    } catch (error) {
      console.error('Error fetching community information:', error);
    }
  
    this.render(); // Render the web part after fetching data
  }
  
  

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription,
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneDropdown('selectedList', {
                  label: 'Select SharePoint List',
                  options: this.properties.availableLists,
                }),
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                }),
                PropertyPaneSlider('numberOfBlocks', {
                  label: 'Number of Blocks',
                  min: 1,
                  max: 10,
                  step: 1,
                }),
                PropertyPaneTextField('seeAllButton',{

                  label: 'Url for See All button'
                })
              ],
            },
          ],
        },
      ],
    };
  }  
}
