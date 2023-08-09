public with sharing class SummarizeCaseCommentsController {
    @AuraEnabled(cacheable=true)
    public static List<CaseCommentsWrapper> getFeedComments(Id sfId) {
        System.debug('sfId: ' + sfId);
        String query = 'Select CommentBody, Id, ParentId, CreatedDate, CreatedBy.Name From CaseComment where ParentId = \'' + 
        String.escapeSingleQuotes(sfId) + '\' order by CreatedDate';

        System.debug('query: ' + query);
        List<sObject> sfObjects = Database.query(query);
        List<CaseCommentsWrapper> caseCommentsWrapperList = new List<CaseCommentsWrapper>();
        for(SObject sfObj : sfObjects) {
            CaseCommentsWrapper caseCommentsWrapper = new CaseCommentsWrapper();
            CaseComment caseComment = (CaseComment)sfObj;
            caseCommentsWrapper.comment = caseComment.CommentBody;
            caseCommentsWrapper.createdBy = caseComment.CreatedBy.Name;
            caseCommentsWrapper.createdDate = caseComment.CreatedDate;
            caseCommentsWrapper.commentId = caseComment.Id;
            caseCommentsWrapperList.add(caseCommentsWrapper);
        }

        return caseCommentsWrapperList;
    }

    public class CaseCommentsWrapper {
        @AuraEnabled
        public String comment;
        @AuraEnabled
        public String createdBy;
        @AuraEnabled
        public Datetime createdDate;
        @AuraEnabled
        public String commentId;
    }
}