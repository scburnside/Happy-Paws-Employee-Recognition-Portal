function deleteAward(id){
    $.ajax({
        url: '/users/deleteAward/' + id,
        type: 'DELETE',
        complete: function(result)
        {
            window.location.reload();
        }
    })
};