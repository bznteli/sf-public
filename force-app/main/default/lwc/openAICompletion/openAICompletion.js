import { LightningElement, api, track, wire } from 'lwc';
import getFeedComments from '@salesforce/apex/SummarizeCaseCommentsController.getFeedComments';

export default class OpenAICompletion extends LightningElement {
    @api recordId;
    summary = '';
    caseComments;
    error;
    cleanComments;
    prompt = "Summarize the text.";

    // Move these over to named credentials and make HTTP call from server
    endpoint = "https://api.openai.com/v1/chat/completions";

    // Add your key here
    key = "YOUR_KEY_HERE";

    @wire(getFeedComments, {sfId: '$recordId'})
    wiredCaseComments({error, data}) {
        if (data) {
            console.log(data);
            this.caseComments = data;
            console.log(this.caseComments);
        } else if (error) {
            this.error = error;
            console.log(error);
        }
    }

    handleChange(event) {
        if (event.target.name === "prompt") {
            this.prompt = event.target.value;
        }
    }

    get allCaseComments() {
        let allComments = [];
        this.cleanComments = '';
        if (this.caseComments) {
            for (const caseComment of this.caseComments) {
                let cleanCaseComment = {};
                cleanCaseComment.createdBy = caseComment.createdBy.Name;
                cleanCaseComment.createdDate = caseComment.createdDate;
                cleanCaseComment.comment = caseComment.comment;
                cleanCaseComment.cleanCommentBody = caseComment.comment.replace(/<[^>]*>?/gm, '');
                this.cleanComments += cleanCaseComment.cleanCommentBody + " ";
                allComments.push(cleanCaseComment);
            }
        }
        return allComments;
    }

    async summarizeCaseComments() {
        try {
            //get the case id
            if (this.allCaseComments) {
                console.log(this.allCaseComments);
            }

            console.log(this.recordId);


            const body = JSON.stringify({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "user", 
                        content: this.prompt + "###" + this.cleanComments + "###"
                    }
                ],
                "temperature": 0.2
            });

            console.log(body);

            const abstractSummarization = await fetch(this.endpoint, {
                method: "post",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": "Bearer " + this.key
                },
                body: body
            });

            console.log(abstractSummarization);
            const abstractSummarizationJson = await abstractSummarization.json();
            console.log(abstractSummarizationJson);
            this.summary = JSON.stringify(abstractSummarizationJson.choices[0].message.content);
        }
        catch (error) {
            console.log(error);
        }
    }
}