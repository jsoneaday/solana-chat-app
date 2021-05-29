use borsh::{ BorshDeserialize, BorshSerialize };
use solana_program::{
    log::sol_log_compute_units,
    account_info::{ next_account_info, AccountInfo },
    entrypoint,
    entrypoint::ProgramResult,
    msg,
    program_error::ProgramError,
    pubkey::Pubkey,
};
use std::io::ErrorKind::InvalidData;

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct ChatMessage {
    pub archive_id: String,
    pub created_on: String
}

// example arweave tx (length 43)
// 1seRanklLU_1VTGkEk7P0xAwMJfA7owA1JHW5KyZKlY
// ReUohI9tEmXQ6EN9H9IkRjY9bSdgql_OdLUCOeMEte0
const DUMMY_TX_ID: &str = "0000000000000000000000000000000000000000000";
const DUMMY_CREATED_ON: &str = "0000000000000000"; // milliseconds, 16 digits
pub fn get_init_chat_message() -> ChatMessage {
    ChatMessage{ archive_id: String::from(DUMMY_TX_ID), created_on: String::from(DUMMY_CREATED_ON) }
}
pub fn get_init_chat_messages() -> Vec<ChatMessage> {
    let mut messages = Vec::new();
    for _ in 0..20 {
        messages.push(get_init_chat_message());
    }
    return messages;
}

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    let accounts_iter = &mut accounts.iter();
    let account = next_account_info(accounts_iter)?;
    if account.owner != program_id {
        msg!("This account {} is not owned by this program {} and cannot be updated!", account.key, program_id);
    }

    sol_log_compute_units();

    let instruction_data_message = ChatMessage::try_from_slice(instruction_data).map_err(|err| {
        msg!("Attempt to deserialize instruction data has failed. {:?}", err);
        ProgramError::InvalidInstructionData
    })?;
    msg!("Instruction_data message object {:?}", instruction_data_message);

    let mut existing_data_messages = match <Vec<ChatMessage>>::try_from_slice(&account.data.borrow_mut()) {
        Ok(data) => data,
        Err(err) => {
            if err.kind() == InvalidData {
                msg!("InvalidData so initializing account data");
                get_init_chat_messages()
            } else {
                panic!("Unknown error decoding account data {:?}", err)
            }
        }
    };
    let index = existing_data_messages.iter().position(|p| p.archive_id == String::from(DUMMY_TX_ID)).unwrap(); // find first dummy data entry
    msg!("Found index {}", index);
    existing_data_messages[index] = instruction_data_message; // set dummy data to new entry
    let updated_data = existing_data_messages.try_to_vec().expect("Failed to encode data."); // set messages object back to vector data
    msg!("Final existing_data_messages[index] {:?}", existing_data_messages[index]);

    // data algorithm for storing data into account and then archiving into Arweave
    // 1. Each ChatMessage object will be prepopulated for txt field having 43 characters (length of a arweave tx).
    // Each ChatMessageContainer will be prepopulated with 10 ChatMessage objects with dummy data.
    // 2. Client will submit an arweave tx for each message; get back the tx id; and submit it to our program.
    // 3. This tx id will be saved to the Solana program and be used for querying back to arweave to get actual data.
    let data = &mut &mut account.data.borrow_mut();
    msg!("Attempting save data.");
    data[..updated_data.len()].copy_from_slice(&updated_data);    
    let saved_data = <Vec<ChatMessage>>::try_from_slice(data)?;
    msg!("ChatMessage has been saved to account data. {:?}", saved_data[index]);
    sol_log_compute_units();

    msg!("End program.");
    Ok(())
}

// Sanity tests
#[cfg(test)]
mod test {
    use super::*;
    use solana_program::clock::Epoch;
    //use std::mem;

    #[test]
    fn test_sanity() {
        let program_id = Pubkey::default();
        let key = Pubkey::default();
        let mut lamports = 0;
        let messages = get_init_chat_messages(); 
        let mut data = messages.try_to_vec().unwrap();
        let owner = Pubkey::default();
        let account = AccountInfo::new(
            &key,
            false,
            true,
            &mut lamports,
            &mut data,
            &owner,
            false,
            Epoch::default(),
        );
        
        let archive_id = "abcdefghijabcdefghijabcdefghijabcdefghijabc";
        let created_on = "0001621449453837";
        let instruction_data_chat_message = ChatMessage{ archive_id: String::from(archive_id), created_on: String::from(created_on) };
        let instruction_data = instruction_data_chat_message.try_to_vec().unwrap();

        let accounts = vec![account];

        process_instruction(&program_id, &accounts, &instruction_data).unwrap();
        let chat_messages = &<Vec<ChatMessage>>::try_from_slice(&accounts[0].data.borrow())
        .unwrap()[0];
        let test_archive_id = &chat_messages.archive_id;
        let test_created_on = &chat_messages.created_on;
        println!("chat message {:?}", &chat_messages);
        // I added first data and expect it to contain the given data
        assert_eq!(
            String::from(archive_id).eq(test_archive_id),
            true
        );
        assert_eq!(
            String::from(created_on).eq(test_created_on),
            true
        );
    }
}
