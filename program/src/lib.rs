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

#[derive(BorshSerialize, BorshDeserialize, Debug)]
pub struct ChatMessage {
    pub txt: String,
    pub created_date: f64,
    pub send_to: String
}

entrypoint!(process_instruction);

pub fn process_instruction(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    instruction_data: &[u8]
) -> ProgramResult {
    msg!("Start program to save message.");

    let accounts_iter = &mut accounts.iter();
    let account = next_account_info(accounts_iter)?;
    if account.owner != program_id {
        msg!("This account {} is not owned by this program {} and cannot be updated!", account.key, program_id);
    }

    sol_log_compute_units();

    log_instruction_data(instruction_data)?;

    let data = &mut &mut account.data.borrow_mut();
    data[..instruction_data.len()].copy_from_slice(&instruction_data);    
    msg!("ChatMessage has been saved to account data.");
    sol_log_compute_units();

    msg!("End program.");
    Ok(())
}

fn log_instruction_data(instruction_data: &[u8]) -> ProgramResult {
    let message = ChatMessage::try_from_slice(instruction_data).map_err(|err| {
        msg!("Attempt to deserialize data has failed! {:?}", err);
        ProgramError::InvalidInstructionData
    })?;
    msg!("ChatMessage given to program is {:?}", message);
    sol_log_compute_units();
    Ok(())
}

// Sanity tests
#[cfg(test)]
mod test {
    use super::*;
    use solana_program::clock::Epoch;
    use std::mem;

    #[test]
    fn test_sanity() {
        let program_id = Pubkey::default();
        let key = Pubkey::default();
        let mut lamports = 0;
        let mut data = vec![0; mem::size_of::<u32>()];
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
        let instruction_data: Vec<u8> = Vec::new();

        let accounts = vec![account];

        assert_eq!(
            ChatMessage::try_from_slice(&accounts[0].data.borrow())
                .unwrap()
                .txt,
            0
        );
        process_instruction(&program_id, &accounts, &instruction_data).unwrap();
        assert_eq!(
            ChatMessage::try_from_slice(&accounts[0].data.borrow())
                .unwrap()
                .txt,
            1
        );
        process_instruction(&program_id, &accounts, &instruction_data).unwrap();
        assert_eq!(
            ChatMessage::try_from_slice(&accounts[0].data.borrow())
                .unwrap()
                .txt,
            2
        );
    }
}
