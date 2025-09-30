import {
  CometChatMessageComposer,
  CometChatMessageHeader,
  CometChatMessageList,
  CometChatTextHighlightFormatter,
  CometChatUIKit,
  getLocalizedString,
  CometChatUserEvents,
} from '@cometchat/chat-uikit-react';
import '../../styles/CometChatMessages/CometChatMessages.css';
import React, { useContext, useEffect, useRef, useState } from 'react';
import { CometChat } from '@cometchat/chat-sdk-javascript';
import { useCometChatContext } from '../../context/CometChatContext';
import { AppContext } from '../../context/AppContext';
import { CometChatSettings } from '../../CometChatSettings';

interface MessagesViewProps {
  user?: CometChat.User;
  group?: CometChat.Group;
  onHeaderClicked: () => void;
  onThreadRepliesClick: (message: CometChat.BaseMessage) => void;
  onSearchClicked?: () => void;
  showComposer?: boolean;
  onBack?: () => void;
  goToMessageId?: string;
  searchKeyword?: string;
}

export const CometChatMessages = (props: MessagesViewProps) => {
  const { chatFeatures, callFeatures, layoutFeatures } = useCometChatContext();

  const {
    user,
    group,
    onHeaderClicked,
    onThreadRepliesClick,
    showComposer,
    onBack = () => {},
    onSearchClicked = () => {},
    goToMessageId,
    searchKeyword,
  } = props;
  const [showComposerState, setShowComposerState] = useState<boolean | undefined>(showComposer);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const { setAppState } = useContext(AppContext);

  const chatFeaturesRef = useRef(chatFeatures);
  useEffect(() => {
    chatFeaturesRef.current = chatFeatures;
    if (
      (group && chatFeaturesRef.current && !chatFeaturesRef.current.deeperUserEngagement?.groupInfo) ||
      (user && chatFeaturesRef.current && !chatFeaturesRef.current.deeperUserEngagement?.userInfo)
    ) {
      setAppState({ type: 'updateSideComponent', payload: { visible: false, type: '' } });
    }

    const iframe = document.getElementById('cometchat-frame') as HTMLIFrameElement;
    const iframeDoc = iframe?.contentDocument || iframe?.contentWindow?.document;
    const targetDiv =
      document.querySelector('.cometchat-messages-wrapper .cometchat-message-header .cometchat-list-item') ||
      iframeDoc?.querySelector('.cometchat-messages-wrapper .cometchat-message-header .cometchat-list-item');
    if (targetDiv) {
      if (
        (user && chatFeatures.deeperUserEngagement.userInfo) ||
        (group && chatFeatures.deeperUserEngagement.groupInfo)
      ) {
        (targetDiv as HTMLElement).style.cursor = 'pointer';
      } else {
        (targetDiv as HTMLElement).style.cursor = 'default';
      }
    }
  }, [chatFeatures, group, user, setAppState]);

  useEffect(() => {
    setShowComposerState(showComposer);
    if (user?.getHasBlockedMe?.()) {
      setShowComposerState(false);
    }
  }, [user, showComposer]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  function getFormatters() {
    const formatters = CometChatUIKit.getDataSource().getAllTextFormatters({});

    if (searchKeyword) {
      formatters.push(new CometChatTextHighlightFormatter(searchKeyword));
    }
    return formatters;
  }

  const determineVideoCallVisibility = () => {
    if (group) {
      // Check group-specific video call permission
      return !callFeatures?.voiceAndVideoCalling?.groupVideoConference;
    } else if (user) {
      // Check one-on-one video call permission
      return !callFeatures?.voiceAndVideoCalling?.oneOnOneVideoCalling;
    }
    return true; // Default to hiding if neither user nor group
  };

  const determineVoiceCallVisibility = () => {
    if (group) {
      // Check group-specific voice call permission
      return !callFeatures?.voiceAndVideoCalling?.groupVoiceConference;
    } else if (user) {
      // Check one-on-one voice call permission
      return !callFeatures?.voiceAndVideoCalling?.oneOnOneVoiceCalling;
    }
    return true; // Default to hiding if neither user nor group
  };

  const determineUserOrGroupInfoVisibility = () => {
    if (group) {
      return chatFeaturesRef.current && chatFeaturesRef.current.deeperUserEngagement?.groupInfo
        ? onHeaderClicked()
        : () => {};
    } else if (user) {
      return chatFeaturesRef.current && chatFeaturesRef.current.deeperUserEngagement?.userInfo
        ? onHeaderClicked()
        : () => {};
    }
  };

  return (
    <div className="cometchat-messages-wrapper">
      <div
        className={`cometchat-header-wrapper 
          ${!layoutFeatures.withSideBar ? 'cometchat-header-wrapper__hide-back-button' : ''}
          ${!isMobile ? 'cometchat-header-wrapper__desktop' : ''}`}
      >
        <CometChatMessageHeader
          user={user}
          group={group}
          onBack={onBack}
          showBackButton={(layoutFeatures && layoutFeatures.withSideBar) || isMobile}
          showSearchOption={
            (chatFeatures && chatFeatures?.coreMessagingExperience?.conversationAndAdvancedSearch) ??
            //  CometChatSettings.chatFeatures.coreMessagingExperience.conversationAndAdvancedSearch
            true
          }
          onSearchOptionClicked={onSearchClicked}
          onItemClick={determineUserOrGroupInfoVisibility}
          auxiliaryButtonView={<></>}
          hideVideoCallButton={determineVideoCallVisibility()}
          hideVoiceCallButton={determineVoiceCallVisibility()}
          showConversationSummaryButton={
            (chatFeatures && chatFeatures?.aiUserCopilot?.conversationSummary) ??
            CometChatSettings.chatFeatures.aiUserCopilot.conversationSummary
          }
          hideUserStatus={
            (chatFeatures && !chatFeatures?.coreMessagingExperience?.userAndFriendsPresence) ??
            !CometChatSettings.chatFeatures.coreMessagingExperience.userAndFriendsPresence
          }
        />
      </div>
      <div className="cometchat-message-list-wrapper">
        <CometChatMessageList
          user={user}
          group={group}
          onThreadRepliesClick={(message: CometChat.BaseMessage) => onThreadRepliesClick(message)}
          goToMessageId={goToMessageId}
          textFormatters={searchKeyword && searchKeyword.trim() !== '' ? getFormatters() : undefined}
          showSmartReplies={
            (chatFeatures && chatFeatures?.aiUserCopilot?.smartReply) ??
            CometChatSettings.chatFeatures.aiUserCopilot.smartReply
          }
          showConversationStarters={
            (chatFeatures && chatFeatures?.aiUserCopilot?.conversationStarter) ??
            CometChatSettings.chatFeatures.aiUserCopilot.conversationStarter
          }
          smartRepliesDelayDuration={1000}
          hideReplyInThreadOption={
            (chatFeatures && !chatFeatures?.coreMessagingExperience?.threadConversationAndReplies) ??
            !CometChatSettings.chatFeatures.coreMessagingExperience.threadConversationAndReplies
          }
          hideTranslateMessageOption={
            (chatFeatures && !chatFeatures?.deeperUserEngagement?.messageTranslation) ??
            !CometChatSettings.chatFeatures.deeperUserEngagement.messageTranslation
          }
          hideEditMessageOption={
            (chatFeatures && !chatFeatures?.coreMessagingExperience?.editMessage) ??
            !CometChatSettings.chatFeatures.coreMessagingExperience.editMessage
          }
          hideDeleteMessageOption={
            (chatFeatures && !chatFeatures?.coreMessagingExperience?.deleteMessage) ??
            !CometChatSettings.chatFeatures.coreMessagingExperience.deleteMessage
          }
          hideReactionOption={
            (chatFeatures && !chatFeatures?.deeperUserEngagement?.reactions) ??
            !CometChatSettings.chatFeatures.deeperUserEngagement.reactions
          }
          hideMessagePrivatelyOption={
            (chatFeatures && !chatFeatures?.privateMessagingWithinGroups?.sendPrivateMessageToGroupMembers) ??
            !CometChatSettings.chatFeatures.privateMessagingWithinGroups.sendPrivateMessageToGroupMembers
          }
          hideReceipts={
            (chatFeatures && !chatFeatures?.coreMessagingExperience?.messageDeliveryAndReadReceipts) ??
            !CometChatSettings.chatFeatures.coreMessagingExperience.messageDeliveryAndReadReceipts
          }
          hideMessageInfoOption={
            (chatFeatures && !chatFeatures?.coreMessagingExperience?.messageDeliveryAndReadReceipts) ??
            !CometChatSettings.chatFeatures.coreMessagingExperience.messageDeliveryAndReadReceipts
          }
          hideModerationView={chatFeatures?.coreMessagingExperience?.moderation === false ? true : false}
        />
      </div>
      {showComposerState ? (
        <div className="cometchat-composer-wrapper">
          <CometChatMessageComposer
            user={user}
            group={group}
            disableMentions={
              (chatFeatures && !chatFeatures?.deeperUserEngagement?.mentions) ??
              !CometChatSettings.chatFeatures.deeperUserEngagement.mentions
            }
            disableTypingEvents={
              (chatFeatures && !chatFeatures?.coreMessagingExperience?.typingIndicator) ??
              !CometChatSettings.chatFeatures.coreMessagingExperience.typingIndicator
            }
            hidePollsOption={
              (chatFeatures && !chatFeatures?.deeperUserEngagement?.polls) ??
              !CometChatSettings.chatFeatures.deeperUserEngagement.polls
            }
            hideCollaborativeDocumentOption={
              (chatFeatures && !chatFeatures?.deeperUserEngagement?.collaborativeDocument) ??
              !CometChatSettings.chatFeatures.deeperUserEngagement.collaborativeDocument
            }
            hideStickersButton={
              (chatFeatures && !chatFeatures?.deeperUserEngagement?.stickers) ??
              !CometChatSettings.chatFeatures.deeperUserEngagement.stickers
            }
            hideEmojiKeyboardButton={
              (chatFeatures && !chatFeatures?.deeperUserEngagement?.emojis) ??
              !CometChatSettings.chatFeatures.deeperUserEngagement.emojis
            }
            hideVoiceRecordingButton={
              (chatFeatures && !chatFeatures?.deeperUserEngagement?.voiceNotes) ??
              !CometChatSettings.chatFeatures.deeperUserEngagement.voiceNotes
            }
            hideCollaborativeWhiteboardOption={
              (chatFeatures && !chatFeatures?.deeperUserEngagement?.collaborativeWhiteboard) ??
              !CometChatSettings.chatFeatures.deeperUserEngagement.collaborativeWhiteboard
            }
            hideVideoAttachmentOption={
              (chatFeatures && !chatFeatures?.coreMessagingExperience?.videoSharing) ??
              !CometChatSettings.chatFeatures.coreMessagingExperience.videoSharing
            }
            hideFileAttachmentOption={
              (chatFeatures && !chatFeatures?.coreMessagingExperience?.fileSharing) ??
              !CometChatSettings.chatFeatures.coreMessagingExperience.fileSharing
            }
            hideAudioAttachmentOption={
              (chatFeatures && !chatFeatures?.coreMessagingExperience?.audioSharing) ??
              !CometChatSettings.chatFeatures.coreMessagingExperience.audioSharing
            }
            hideImageAttachmentOption={
              (chatFeatures && !chatFeatures?.coreMessagingExperience?.photosSharing) ??
              !CometChatSettings.chatFeatures.coreMessagingExperience.photosSharing
            }
          />
        </div>
      ) : (
        <div
          className="message-composer-blocked"
          onClick={() => {
            if (user) {
              CometChat.unblockUsers([user?.getUid()]).then(() => {
                user.setBlockedByMe(false);
                CometChatUserEvents.ccUserUnblocked.next(user);
              });
            }
          }}
        >
          <div className="message-composer-blocked__text">
            {getLocalizedString('cannot_send_to_blocked_user')}{' '}
            <span className="message-composer-blocked__text-unblock"> {getLocalizedString('click_to_unblock')}</span>
          </div>
        </div>
      )}
    </div>
  );
};
